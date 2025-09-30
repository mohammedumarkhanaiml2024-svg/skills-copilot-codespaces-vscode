"""
AI-Powered Personalization Engine

A comprehensive system for learning from user habits, moods, and activities
to provide personalized guidance and recommendations.
"""

from .models import UserEntry, UserProfile, Recommendation, MoodType
from .storage import DataStorage
from .learning_engine import LearningEngine
from .personalization_service import PersonalizationService

__version__ = "1.0.0"
__all__ = [
    'UserEntry',
    'UserProfile', 
    'Recommendation',
    'MoodType',
    'DataStorage',
    'LearningEngine',
    'PersonalizationService',
    'PersonalizationEngine'
]


class PersonalizationEngine:
    """
    Main interface for the AI-Powered Personalization Engine.
    
    This class provides a unified API for:
    - Logging user entries (moods, activities, routines)
    - Analyzing patterns and generating insights
    - Getting personalized recommendations
    - Tracking progress and metrics
    """
    
    def __init__(self, data_dir: str = "data/user_data"):
        """
        Initialize the personalization engine.
        
        Args:
            data_dir: Directory for storing user data
        """
        self.storage = DataStorage(data_dir)
        self.learning_engine = LearningEngine()
        self.personalization_service = PersonalizationService(self.learning_engine)
    
    def create_user(self, user_id: str) -> UserProfile:
        """
        Create a new user profile.
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            Created UserProfile
        """
        return self.storage.create_user_profile(user_id)
    
    def log_entry(
        self,
        user_id: str,
        mood: str,
        activities: list = None,
        energy_level: int = 5,
        sleep_hours: float = None,
        notes: str = "",
        tags: list = None
    ) -> UserEntry:
        """
        Log a new entry for the user.
        
        Args:
            user_id: User identifier
            mood: Current mood (e.g., 'happy', 'sad', 'energetic')
            activities: List of activities performed
            energy_level: Energy level on 1-10 scale
            sleep_hours: Hours of sleep
            notes: Additional notes
            tags: Tags for categorization
            
        Returns:
            Created UserEntry
        """
        from datetime import datetime
        
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood=mood,
            activities=activities or [],
            energy_level=energy_level,
            sleep_hours=sleep_hours,
            notes=notes,
            tags=tags or []
        )
        
        self.storage.add_entry(user_id, entry)
        return entry
    
    def get_recommendations(
        self,
        user_id: str,
        current_mood: str = None,
        context: dict = None
    ) -> list:
        """
        Get personalized recommendations for the user.
        
        Args:
            user_id: User identifier
            current_mood: Optional current mood for context-aware recommendations
            context: Additional context information
            
        Returns:
            List of Recommendation objects
        """
        profile = self.storage.load_user_profile(user_id)
        if profile is None:
            profile = self.create_user(user_id)
        
        return self.personalization_service.generate_recommendations(
            profile, current_mood, context
        )
    
    def get_insights(self, user_id: str) -> dict:
        """
        Get analytical insights about user patterns.
        
        Args:
            user_id: User identifier
            
        Returns:
            Dictionary containing insights and patterns
        """
        profile = self.storage.load_user_profile(user_id)
        if profile is None:
            return {'error': 'User not found'}
        
        return self.learning_engine.analyze_patterns(profile)
    
    def get_summary(self, user_id: str) -> dict:
        """
        Get a daily summary for the user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Dictionary containing summary information
        """
        profile = self.storage.load_user_profile(user_id)
        if profile is None:
            return {'error': 'User not found'}
        
        return self.personalization_service.get_daily_summary(profile)
    
    def get_user_profile(self, user_id: str) -> UserProfile:
        """
        Get the user's full profile.
        
        Args:
            user_id: User identifier
            
        Returns:
            UserProfile object or None if not found
        """
        return self.storage.load_user_profile(user_id)
