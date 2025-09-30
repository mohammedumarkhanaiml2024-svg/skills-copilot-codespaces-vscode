const DailyLog = require('../models/DailyLog');

class RecommendationEngine {
  constructor() {
    this.habitPatterns = new Map();
    this.moodCorrelations = new Map();
  }

  async generatePersonalizedRecommendations(userId, currentMood, recentLogs) {
    const analysis = await this.analyzeUserPatterns(userId, recentLogs);
    const recommendations = this.buildRecommendations(currentMood, analysis);
    
    return {
      recommendations,
      analysis,
      confidence: this.calculateRecommendationConfidence(analysis)
    };
  }

  async analyzeUserPatterns(userId, recentLogs) {
    const analysis = {
      habitSuccess: this.analyzeHabitPatterns(recentLogs),
      moodTriggers: this.analyzeMoodTriggers(recentLogs),
      activityCorrelations: this.analyzeActivityCorrelations(recentLogs),
      timePatterns: this.analyzeTimePatterns(recentLogs),
      streaks: this.calculateStreaks(recentLogs)
    };

    return analysis;
  }

  analyzeHabitPatterns(logs) {
    const habitStats = new Map();
    
    logs.forEach(log => {
      log.habits.forEach(habit => {
        const name = habit.name;
        if (!habitStats.has(name)) {
          habitStats.set(name, {
            attempts: 0,
            completions: 0,
            avgDifficulty: 0,
            moodImpact: []
          });
        }
        
        const stats = habitStats.get(name);
        stats.attempts++;
        if (habit.completed) stats.completions++;
        stats.avgDifficulty = (stats.avgDifficulty + habit.difficulty) / 2;
        stats.moodImpact.push(log.mood.score);
      });
    });

    return Array.from(habitStats.entries()).map(([name, stats]) => ({
      name,
      successRate: stats.completions / stats.attempts,
      avgDifficulty: stats.avgDifficulty,
      avgMoodWhenDone: stats.moodImpact.reduce((a, b) => a + b, 0) / stats.moodImpact.length,
      frequency: stats.attempts
    }));
  }

  analyzeMoodTriggers(logs) {
    const triggers = {
      lowMoodDays: [],
      highMoodDays: [],
      patterns: []
    };

    logs.forEach(log => {
      if (log.mood.score <= 4) {
        triggers.lowMoodDays.push({
          date: log.date,
          habits: log.habits.map(h => h.name),
          activities: log.activities.map(a => a.type),
          completedHabits: log.habits.filter(h => h.completed).length
        });
      } else if (log.mood.score >= 7) {
        triggers.highMoodDays.push({
          date: log.date,
          habits: log.habits.map(h => h.name),
          activities: log.activities.map(a => a.type),
          completedHabits: log.habits.filter(h => h.completed).length
        });
      }
    });

    return triggers;
  }

  analyzeActivityCorrelations(logs) {
    const activityImpact = new Map();
    
    logs.forEach(log => {
      log.activities.forEach(activity => {
        const key = activity.type;
        if (!activityImpact.has(key)) {
          activityImpact.set(key, {
            instances: 0,
            totalEnjoyment: 0,
            totalDuration: 0,
            moodScores: []
          });
        }
        
        const impact = activityImpact.get(key);
        impact.instances++;
        impact.totalEnjoyment += activity.enjoyment || 0;
        impact.totalDuration += activity.duration || 0;
        impact.moodScores.push(log.mood.score);
      });
    });

    return Array.from(activityImpact.entries()).map(([type, data]) => ({
      type,
      avgEnjoyment: data.totalEnjoyment / data.instances,
      avgDuration: data.totalDuration / data.instances,
      avgMoodAfter: data.moodScores.reduce((a, b) => a + b, 0) / data.moodScores.length,
      frequency: data.instances
    }));
  }

  analyzeTimePatterns(logs) {
    const dayOfWeekMood = new Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
    
    logs.forEach(log => {
      const dayOfWeek = new Date(log.date).getDay();
      dayOfWeekMood[dayOfWeek].total += log.mood.score;
      dayOfWeekMood[dayOfWeek].count++;
    });

    return dayOfWeekMood.map((day, index) => ({
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      avgMood: day.count > 0 ? day.total / day.count : 0,
      entries: day.count
    }));
  }

  calculateStreaks(logs) {
    const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    sortedLogs.forEach(log => {
      const logDate = new Date(log.date);
      
      if (lastDate) {
        const daysDiff = Math.floor((logDate - lastDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = logDate;
    });

    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      current: currentStreak,
      longest: longestStreak,
      totalEntries: logs.length
    };
  }

  buildRecommendations(currentMood, analysis) {
    const recommendations = {
      habits: this.recommendHabits(currentMood, analysis),
      activities: this.recommendActivities(currentMood, analysis),
      goals: this.recommendGoals(analysis),
      insights: this.generateInsights(analysis)
    };

    return recommendations;
  }

  recommendHabits(currentMood, analysis) {
    const { habitSuccess, moodTriggers } = analysis;
    const recommendations = [];

    // Recommend successful habits
    const successfulHabits = habitSuccess
      .filter(h => h.successRate > 0.7 && h.avgMoodWhenDone > 6)
      .sort((a, b) => b.successRate - a.successRate);

    if (successfulHabits.length > 0) {
      recommendations.push({
        type: 'maintain',
        title: 'Keep up your successful habits',
        habits: successfulHabits.slice(0, 3).map(h => h.name),
        reason: 'These habits have high success rates and positive mood correlation'
      });
    }

    // Recommend struggling habits improvement
    const strugglingHabits = habitSuccess
      .filter(h => h.successRate < 0.5 && h.frequency > 2)
      .sort((a, b) => a.successRate - b.successRate);

    if (strugglingHabits.length > 0) {
      recommendations.push({
        type: 'improve',
        title: 'Consider adjusting these habits',
        habits: strugglingHabits.slice(0, 2).map(h => ({
          name: h.name,
          suggestion: h.avgDifficulty > 3 ? 'Try reducing difficulty' : 'Break into smaller steps'
        })),
        reason: 'These habits have low completion rates'
      });
    }

    // Mood-based recommendations
    if (currentMood.score <= 4) {
      const moodBoostingHabits = habitSuccess
        .filter(h => h.avgMoodWhenDone > currentMood.score + 1)
        .slice(0, 2);

      if (moodBoostingHabits.length > 0) {
        recommendations.push({
          type: 'boost',
          title: 'Try these mood-boosting habits',
          habits: moodBoostingHabits.map(h => h.name),
          reason: 'These habits typically improve your mood'
        });
      }
    }

    return recommendations;
  }

  recommendActivities(currentMood, analysis) {
    const { activityCorrelations } = analysis;
    const recommendations = [];

    // High enjoyment activities
    const enjoyableActivities = activityCorrelations
      .filter(a => a.avgEnjoyment > 7)
      .sort((a, b) => b.avgEnjoyment - a.avgEnjoyment);

    if (enjoyableActivities.length > 0) {
      recommendations.push({
        type: 'enjoyment',
        title: 'Activities you typically enjoy',
        activities: enjoyableActivities.slice(0, 3).map(a => a.type),
        reason: `Average enjoyment: ${enjoyableActivities[0].avgEnjoyment.toFixed(1)}/10`
      });
    }

    // Mood-improving activities
    const moodImprovingActivities = activityCorrelations
      .filter(a => a.avgMoodAfter > currentMood.score)
      .sort((a, b) => b.avgMoodAfter - a.avgMoodAfter);

    if (moodImprovingActivities.length > 0 && currentMood.score < 7) {
      recommendations.push({
        type: 'mood',
        title: 'Activities that boost your mood',
        activities: moodImprovingActivities.slice(0, 2).map(a => a.type),
        reason: 'These activities correlate with higher mood scores'
      });
    }

    return recommendations;
  }

  recommendGoals(analysis) {
    const { streaks, habitSuccess } = analysis;
    const goals = [];

    // Streak goals
    if (streaks.current > 0) {
      goals.push({
        type: 'streak',
        title: `Extend your logging streak to ${streaks.current + 7} days`,
        current: streaks.current,
        target: streaks.current + 7,
        motivation: 'Consistency is key to building lasting habits'
      });
    }

    // Habit improvement goals
    const improvableHabits = habitSuccess.filter(h => h.successRate > 0.3 && h.successRate < 0.8);
    if (improvableHabits.length > 0) {
      const habit = improvableHabits[0];
      goals.push({
        type: 'habit',
        title: `Improve "${habit.name}" completion rate`,
        current: `${Math.round(habit.successRate * 100)}%`,
        target: `${Math.min(Math.round(habit.successRate * 100) + 20, 90)}%`,
        motivation: 'Small improvements compound over time'
      });
    }

    return goals;
  }

  generateInsights(analysis) {
    const insights = [];
    const { habitSuccess, moodTriggers, timePatterns, streaks } = analysis;

    // Habit insights
    if (habitSuccess.length > 0) {
      const bestHabit = habitSuccess.reduce((best, current) => 
        current.successRate > best.successRate ? current : best
      );
      
      insights.push({
        type: 'success',
        message: `Your most successful habit is "${bestHabit.name}" with a ${Math.round(bestHabit.successRate * 100)}% completion rate`
      });
    }

    // Day pattern insights
    if (timePatterns.length > 0) {
      const bestDay = timePatterns.reduce((best, current) => 
        current.avgMood > best.avgMood ? current : best
      );
      
      insights.push({
        type: 'pattern',
        message: `${bestDay.dayOfWeek}s tend to be your best days with an average mood of ${bestDay.avgMood.toFixed(1)}`
      });
    }

    // Streak insights
    if (streaks.longest > 7) {
      insights.push({
        type: 'achievement',
        message: `Your longest logging streak was ${streaks.longest} days - you can do it again!`
      });
    }

    return insights;
  }

  calculateRecommendationConfidence(analysis) {
    let confidence = 0.5;
    
    // More data = higher confidence
    if (analysis.streaks.totalEntries > 7) confidence += 0.2;
    if (analysis.streaks.totalEntries > 30) confidence += 0.2;
    
    // Pattern strength
    if (analysis.habitSuccess.length > 3) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}

module.exports = RecommendationEngine;