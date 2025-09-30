"""
AI Learning Engine for analyzing user patterns and generating insights.
"""
from typing import List, Dict, Any, Tuple
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import numpy as np
from .models import UserEntry, UserProfile


class LearningEngine:
    """AI engine that learns from user behavior and patterns."""
    
    def __init__(self):
        """Initialize the learning engine."""
        self.mood_weights = {
            'very_happy': 2.0,
            'happy': 1.5,
            'energetic': 1.5,
            'calm': 1.0,
            'neutral': 0.0,
            'tired': -0.5,
            'anxious': -1.0,
            'stressed': -1.5,
            'sad': -2.0,
            'very_sad': -2.5
        }
    
    def analyze_patterns(self, profile: UserProfile) -> Dict[str, Any]:
        """Analyze user patterns from historical data."""
        if not profile.entries:
            return {
                'total_entries': 0,
                'mood_distribution': {},
                'common_activities': [],
                'average_energy': 0,
                'average_sleep': 0,
                'insights': []
            }
        
        entries = profile.entries
        
        # Mood analysis
        mood_counter = Counter(entry.mood for entry in entries)
        mood_distribution = dict(mood_counter)
        
        # Activity analysis
        all_activities = []
        for entry in entries:
            all_activities.extend(entry.activities)
        common_activities = [activity for activity, count in 
                           Counter(all_activities).most_common(10)]
        
        # Energy and sleep analysis
        energy_levels = [entry.energy_level for entry in entries]
        sleep_hours = [entry.sleep_hours for entry in entries 
                      if entry.sleep_hours is not None]
        
        average_energy = np.mean(energy_levels) if energy_levels else 0
        average_sleep = np.mean(sleep_hours) if sleep_hours else 0
        
        # Generate insights
        insights = self._generate_insights(
            entries, mood_distribution, average_energy, average_sleep
        )
        
        return {
            'total_entries': len(entries),
            'mood_distribution': mood_distribution,
            'common_activities': common_activities,
            'average_energy': float(average_energy),
            'average_sleep': float(average_sleep),
            'insights': insights
        }
    
    def _generate_insights(
        self, 
        entries: List[UserEntry], 
        mood_distribution: Dict[str, int],
        average_energy: float,
        average_sleep: float
    ) -> List[str]:
        """Generate insights from analyzed data."""
        insights = []
        
        # Energy insights
        if average_energy < 4:
            insights.append(
                "Your average energy level is below optimal. "
                "Consider adjusting sleep schedule or increasing physical activity."
            )
        elif average_energy > 7:
            insights.append(
                "You maintain high energy levels! Keep up your current routine."
            )
        
        # Sleep insights
        if 0 < average_sleep < 6:
            insights.append(
                "You're averaging less than 6 hours of sleep. "
                "Prioritizing more sleep could improve your well-being."
            )
        elif average_sleep >= 7 and average_sleep <= 9:
            insights.append(
                "Your sleep pattern is healthy. Maintain this routine."
            )
        
        # Mood insights
        negative_moods = ['sad', 'very_sad', 'anxious', 'stressed']
        negative_count = sum(
            mood_distribution.get(mood, 0) for mood in negative_moods
        )
        total_moods = sum(mood_distribution.values())
        
        if total_moods > 0:
            negative_ratio = negative_count / total_moods
            if negative_ratio > 0.5:
                insights.append(
                    "More than half of your entries show challenging moods. "
                    "Consider stress management techniques or professional support."
                )
        
        return insights
    
    def predict_mood_trend(self, profile: UserProfile) -> str:
        """Predict mood trend based on recent entries."""
        recent_entries = profile.get_recent_entries(7)
        if len(recent_entries) < 2:
            return "neutral"
        
        # Calculate weighted mood scores
        scores = []
        for entry in recent_entries:
            mood = entry.mood.lower()
            score = self.mood_weights.get(mood, 0)
            scores.append(score)
        
        # Calculate trend
        if len(scores) >= 3:
            recent_avg = np.mean(scores[-3:])
            overall_avg = np.mean(scores)
            
            if recent_avg > overall_avg + 0.5:
                return "improving"
            elif recent_avg < overall_avg - 0.5:
                return "declining"
        
        return "stable"
    
    def find_activity_mood_correlations(
        self, 
        profile: UserProfile
    ) -> Dict[str, float]:
        """Find correlations between activities and positive moods."""
        if len(profile.entries) < 5:
            return {}
        
        activity_mood_scores = defaultdict(list)
        
        for entry in profile.entries:
            mood_score = self.mood_weights.get(entry.mood.lower(), 0)
            for activity in entry.activities:
                activity_mood_scores[activity].append(mood_score)
        
        # Calculate average mood score for each activity
        correlations = {}
        for activity, scores in activity_mood_scores.items():
            if len(scores) >= 2:
                correlations[activity] = float(np.mean(scores))
        
        return correlations
    
    def get_personalized_metrics(
        self, 
        profile: UserProfile
    ) -> Dict[str, Any]:
        """Get personalized metrics for the user."""
        recent_entries = profile.get_recent_entries(30)
        
        if not recent_entries:
            return {
                'consistency_score': 0,
                'well_being_score': 0,
                'activity_diversity': 0
            }
        
        # Consistency score (how regularly user logs entries)
        if len(profile.entries) >= 7:
            # Check entries over last 7 days if available
            consistency_score = min(len(recent_entries) / 7.0 * 100, 100)
        else:
            consistency_score = len(profile.entries) / 7.0 * 100
        
        # Well-being score based on mood, energy, and sleep
        well_being_scores = []
        for entry in recent_entries:
            mood_score = self.mood_weights.get(entry.mood.lower(), 0)
            energy_score = (entry.energy_level - 5) / 5.0  # Normalize to -1 to 1
            
            # Combine scores
            entry_score = (mood_score + energy_score) / 2
            well_being_scores.append(entry_score)
        
        well_being = float(np.mean(well_being_scores)) if well_being_scores else 0
        # Convert to 0-100 scale
        well_being_score = (well_being + 2.5) / 5.0 * 100
        
        # Activity diversity
        all_activities = set()
        for entry in recent_entries:
            all_activities.update(entry.activities)
        activity_diversity = len(all_activities)
        
        return {
            'consistency_score': round(consistency_score, 1),
            'well_being_score': round(well_being_score, 1),
            'activity_diversity': activity_diversity
        }
