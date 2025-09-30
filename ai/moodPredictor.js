const DailyLog = require('../models/DailyLog');

class MoodPredictor {
  constructor() {
    this.features = [
      'dayOfWeek',
      'completedHabits',
      'totalActivities',
      'avgActivityEnjoyment',
      'previousMood',
      'streakLength'
    ];
  }

  async predictMood(userId, targetDate) {
    try {
      const historicalData = await this.getHistoricalData(userId);
      
      if (historicalData.length < 7) {
        return {
          predictedMood: null,
          confidence: 0,
          message: 'Need at least 7 days of data for prediction'
        };
      }

      const features = await this.extractFeatures(userId, targetDate, historicalData);
      const prediction = this.simpleLinearPredict(features, historicalData);
      
      return {
        predictedMood: Math.max(1, Math.min(10, Math.round(prediction.mood * 10) / 10)),
        confidence: prediction.confidence,
        factors: prediction.factors,
        suggestions: this.generatePredictionBasedSuggestions(prediction)
      };
    } catch (error) {
      console.error('Mood prediction error:', error);
      return {
        predictedMood: null,
        confidence: 0,
        message: 'Unable to generate prediction'
      };
    }
  }

  async getHistoricalData(userId) {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    return await DailyLog.find({
      userId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: 1 });
  }

  async extractFeatures(userId, targetDate, historicalData) {
    const target = new Date(targetDate);
    const dayOfWeek = target.getDay();
    
    // Get recent patterns
    const recentLogs = historicalData.slice(-14); // Last 2 weeks
    const lastLog = historicalData[historicalData.length - 1];
    
    // Calculate averages from historical data
    const avgCompletedHabits = this.calculateAverage(
      historicalData.map(log => log.habits.filter(h => h.completed).length)
    );
    
    const avgTotalActivities = this.calculateAverage(
      historicalData.map(log => log.activities.length)
    );
    
    const avgActivityEnjoyment = this.calculateAverage(
      historicalData.flatMap(log => 
        log.activities.map(a => a.enjoyment || 5)
      )
    );

    // Day of week mood pattern
    const dayOfWeekMoods = this.groupByDayOfWeek(historicalData);
    const dayOfWeekAvg = dayOfWeekMoods[dayOfWeek] || 5;

    return {
      dayOfWeek: dayOfWeekAvg,
      completedHabits: avgCompletedHabits,
      totalActivities: avgTotalActivities,
      avgActivityEnjoyment,
      previousMood: lastLog ? lastLog.mood.score : 5,
      streakLength: this.calculateCurrentStreak(historicalData)
    };
  }

  groupByDayOfWeek(logs) {
    const dayGroups = Array.from({ length: 7 }, () => []);
    
    logs.forEach(log => {
      const dayOfWeek = new Date(log.date).getDay();
      dayGroups[dayOfWeek].push(log.mood.score);
    });
    
    return dayGroups.map(scores => 
      scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 5
    );
  }

  calculateCurrentStreak(logs) {
    if (logs.length === 0) return 0;
    
    let streak = 1;
    for (let i = logs.length - 2; i >= 0; i--) {
      const current = new Date(logs[i + 1].date);
      const previous = new Date(logs[i].date);
      const daysDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b) / numbers.length;
  }

  simpleLinearPredict(features, historicalData) {
    // Simple weighted prediction based on patterns
    const weights = {
      dayOfWeek: 0.25,
      completedHabits: 0.20,
      totalActivities: 0.15,
      avgActivityEnjoyment: 0.15,
      previousMood: 0.15,
      streakLength: 0.10
    };

    let predictedMood = 0;
    let confidence = 0.6;
    const factors = [];

    // Day of week influence
    const dayOfWeekContribution = features.dayOfWeek * weights.dayOfWeek;
    predictedMood += dayOfWeekContribution;
    factors.push({
      factor: 'Day of week pattern',
      contribution: dayOfWeekContribution,
      description: `Historical mood for this day: ${features.dayOfWeek.toFixed(1)}`
    });

    // Habits influence
    const habitContribution = (features.completedHabits / 5) * 10 * weights.completedHabits;
    predictedMood += habitContribution;
    factors.push({
      factor: 'Habit completion',
      contribution: habitContribution,
      description: `Average completed habits: ${features.completedHabits.toFixed(1)}`
    });

    // Activities influence  
    const activityContribution = Math.min(features.totalActivities / 3, 1) * 10 * weights.totalActivities;
    predictedMood += activityContribution;
    factors.push({
      factor: 'Activity level',
      contribution: activityContribution,
      description: `Average activities: ${features.totalActivities.toFixed(1)}`
    });

    // Enjoyment influence
    const enjoymentContribution = features.avgActivityEnjoyment * weights.avgActivityEnjoyment;
    predictedMood += enjoymentContribution;
    factors.push({
      factor: 'Activity enjoyment',
      contribution: enjoymentContribution,
      description: `Average enjoyment: ${features.avgActivityEnjoyment.toFixed(1)}/10`
    });

    // Previous mood influence (momentum)
    const momentumContribution = features.previousMood * weights.previousMood;
    predictedMood += momentumContribution;
    factors.push({
      factor: 'Mood momentum',
      contribution: momentumContribution,
      description: `Previous mood: ${features.previousMood}`
    });

    // Streak influence
    const streakContribution = Math.min(features.streakLength / 7, 1) * 2 * weights.streakLength;
    predictedMood += streakContribution;
    factors.push({
      factor: 'Logging streak',
      contribution: streakContribution,
      description: `Current streak: ${features.streakLength} days`
    });

    // Adjust confidence based on data quality
    if (historicalData.length > 30) confidence += 0.2;
    if (historicalData.length > 14) confidence += 0.1;
    
    confidence = Math.min(confidence, 0.9);

    return {
      mood: predictedMood,
      confidence,
      factors: factors.sort((a, b) => b.contribution - a.contribution)
    };
  }

  generatePredictionBasedSuggestions(prediction) {
    const suggestions = [];
    const { mood, factors } = prediction;

    if (mood < 5) {
      suggestions.push({
        type: 'preventive',
        title: 'Prepare for a challenging day',
        actions: [
          'Plan extra self-care activities',
          'Schedule time with supportive people',
          'Prepare mood-boosting activities',
          'Consider lighter goals for the day'
        ]
      });
    } else if (mood > 7) {
      suggestions.push({
        type: 'capitalize',
        title: 'Make the most of a good day',
        actions: [
          'Tackle challenging tasks',
          'Try new activities',
          'Connect with others',
          'Set ambitious but achievable goals'
        ]
      });
    }

    // Factor-specific suggestions
    const topFactor = factors[0];
    if (topFactor.factor === 'Habit completion' && topFactor.contribution > 1) {
      suggestions.push({
        type: 'habit',
        title: 'Focus on habit consistency',
        actions: ['Complete your most important habits early', 'Set reminders for habit completion']
      });
    }

    if (topFactor.factor === 'Activity enjoyment' && topFactor.contribution > 1) {
      suggestions.push({
        type: 'activity',
        title: 'Prioritize enjoyable activities',
        actions: ['Schedule activities you typically enjoy', 'Try new variations of favorite activities']
      });
    }

    return suggestions;
  }

  async getMoodTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await DailyLog.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (logs.length < 3) {
      return { trend: 'insufficient_data', message: 'Need more data for trend analysis' };
    }

    const moods = logs.map(log => log.mood.score);
    const trend = this.calculateTrend(moods);
    
    return {
      trend: trend.direction,
      strength: trend.strength,
      correlation: trend.correlation,
      message: this.interpretTrend(trend),
      dataPoints: logs.length
    };
  }

  calculateTrend(values) {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    // Simple linear regression
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * values[i], 0);
    const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = xValues.reduce((acc, x, i) => acc + (x - meanX) * (values[i] - meanY), 0);
    const denomX = Math.sqrt(xValues.reduce((acc, x) => acc + (x - meanX) ** 2, 0));
    const denomY = Math.sqrt(values.reduce((acc, y) => acc + (y - meanY) ** 2, 0));
    const correlation = numerator / (denomX * denomY);
    
    return {
      slope,
      intercept,
      correlation,
      direction: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
      strength: Math.abs(correlation)
    };
  }

  interpretTrend(trend) {
    const { direction, strength, correlation } = trend;
    
    if (strength < 0.3) {
      return 'Your mood has been relatively stable with no clear trend.';
    } else if (direction === 'improving') {
      return `Your mood has been improving over time (correlation: ${correlation.toFixed(2)}).`;
    } else if (direction === 'declining') {
      return `Your mood has been declining recently (correlation: ${correlation.toFixed(2)}). Consider focusing on self-care.`;
    } else {
      return 'Your mood shows a stable pattern with minor fluctuations.';
    }
  }
}

module.exports = MoodPredictor;