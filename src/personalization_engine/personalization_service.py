"""
Personalization Service for generating context-aware recommendations.
"""
from typing import List, Dict, Any
from datetime import datetime
from .models import UserProfile, Recommendation, UserEntry
from .learning_engine import LearningEngine


class PersonalizationService:
    """Service that generates personalized recommendations and advice."""
    
    def __init__(self, learning_engine: LearningEngine):
        """Initialize personalization service."""
        self.learning_engine = learning_engine
    
    def generate_recommendations(
        self, 
        profile: UserProfile,
        current_mood: str = None,
        context: Dict[str, Any] = None
    ) -> List[Recommendation]:
        """Generate personalized recommendations based on user profile and context."""
        recommendations = []
        
        if not profile.entries:
            # Welcome recommendations for new users
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content="Welcome! Start by logging your daily mood and activities to receive personalized guidance.",
                priority=5,
                context={'reason': 'new_user'}
            ))
            return recommendations
        
        # Analyze patterns
        patterns = self.learning_engine.analyze_patterns(profile)
        mood_trend = self.learning_engine.predict_mood_trend(profile)
        metrics = self.learning_engine.get_personalized_metrics(profile)
        correlations = self.learning_engine.find_activity_mood_correlations(profile)
        
        # Context-aware recommendations based on current mood
        if current_mood:
            recommendations.extend(
                self._mood_based_recommendations(
                    current_mood, correlations, patterns
                )
            )
        
        # Trend-based recommendations
        if mood_trend == "declining":
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content="Your mood has been declining recently. Consider activities that have helped you feel better in the past.",
                priority=4,
                context={'trend': mood_trend, 'correlations': correlations}
            ))
        elif mood_trend == "improving":
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content="Great! Your mood has been improving. Keep up the activities that are working for you.",
                priority=3,
                context={'trend': mood_trend}
            ))
        
        # Activity recommendations
        if correlations:
            recommendations.extend(
                self._activity_recommendations(correlations, profile)
            )
        
        # Well-being reminders
        if metrics['well_being_score'] < 40:
            recommendations.append(Recommendation(
                recommendation_type="reminder",
                content="Your well-being score suggests you need extra care. Prioritize self-care activities today.",
                priority=5,
                context={'well_being_score': metrics['well_being_score']}
            ))
        
        # Consistency encouragement
        if metrics['consistency_score'] < 50:
            recommendations.append(Recommendation(
                recommendation_type="reminder",
                content="Regular check-ins help the AI learn better. Try to log your mood daily!",
                priority=2,
                context={'consistency_score': metrics['consistency_score']}
            ))
        
        # Sleep recommendations
        if patterns['average_sleep'] > 0 and patterns['average_sleep'] < 7:
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content=f"You're averaging {patterns['average_sleep']:.1f} hours of sleep. Aim for 7-9 hours for better energy.",
                priority=4,
                context={'average_sleep': patterns['average_sleep']}
            ))
        
        # Energy level recommendations
        recent_entry = profile.get_recent_entries(1)[0] if profile.entries else None
        if recent_entry and recent_entry.energy_level < 4:
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content="Your energy is low. Try a short walk, healthy snack, or quick rest to recharge.",
                priority=3,
                context={'energy_level': recent_entry.energy_level}
            ))
        
        # Sort by priority (highest first)
        recommendations.sort(key=lambda x: x.priority, reverse=True)
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _mood_based_recommendations(
        self,
        current_mood: str,
        correlations: Dict[str, float],
        patterns: Dict[str, Any]
    ) -> List[Recommendation]:
        """Generate recommendations based on current mood."""
        recommendations = []
        mood_lower = current_mood.lower()
        
        # Negative mood support
        if mood_lower in ['sad', 'very_sad', 'anxious', 'stressed']:
            # Find positive activities
            positive_activities = [
                activity for activity, score in correlations.items()
                if score > 0.5
            ]
            
            if positive_activities:
                recommendations.append(Recommendation(
                    recommendation_type="activity",
                    content=f"When feeling {current_mood}, try: {', '.join(positive_activities[:3])}. These activities have lifted your mood before.",
                    priority=5,
                    context={
                        'current_mood': current_mood,
                        'suggested_activities': positive_activities[:3]
                    }
                ))
            else:
                recommendations.append(Recommendation(
                    recommendation_type="advice",
                    content=f"Feeling {current_mood} is okay. Try gentle activities like breathing exercises, a walk, or talking to someone you trust.",
                    priority=4,
                    context={'current_mood': current_mood}
                ))
        
        # Tired mood
        elif mood_lower == 'tired':
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content="Feeling tired? Consider a power nap, light exercise, or ensuring you're staying hydrated.",
                priority=3,
                context={'current_mood': current_mood}
            ))
        
        # Positive mood reinforcement
        elif mood_lower in ['happy', 'very_happy', 'energetic']:
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content=f"You're feeling {current_mood}! Great time to tackle challenging tasks or enjoy activities you love.",
                priority=2,
                context={'current_mood': current_mood}
            ))
        
        return recommendations
    
    def _activity_recommendations(
        self,
        correlations: Dict[str, float],
        profile: UserProfile
    ) -> List[Recommendation]:
        """Generate activity-based recommendations."""
        recommendations = []
        
        # Find top positive activities
        sorted_activities = sorted(
            correlations.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        top_activities = [act for act, score in sorted_activities[:3] if score > 0]
        
        if top_activities:
            recommendations.append(Recommendation(
                recommendation_type="activity",
                content=f"Activities that boost your mood: {', '.join(top_activities)}. Try incorporating them more often!",
                priority=3,
                context={'top_activities': top_activities}
            ))
        
        # Find activities to avoid or be mindful of
        bottom_activities = [
            act for act, score in sorted_activities[-3:]
            if score < -0.5
        ]
        
        if bottom_activities:
            recommendations.append(Recommendation(
                recommendation_type="advice",
                content=f"Consider moderating: {', '.join(bottom_activities)}. These tend to correlate with lower mood.",
                priority=2,
                context={'watch_activities': bottom_activities}
            ))
        
        return recommendations
    
    def get_daily_summary(self, profile: UserProfile) -> Dict[str, Any]:
        """Generate a daily summary for the user."""
        patterns = self.learning_engine.analyze_patterns(profile)
        metrics = self.learning_engine.get_personalized_metrics(profile)
        recent_entries = profile.get_recent_entries(7)
        
        return {
            'total_entries': patterns['total_entries'],
            'metrics': metrics,
            'recent_mood_trend': self.learning_engine.predict_mood_trend(profile),
            'insights': patterns['insights'],
            'streak_days': len(recent_entries),
            'timestamp': datetime.utcnow().isoformat()
        }
