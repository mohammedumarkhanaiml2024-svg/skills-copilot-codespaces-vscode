"""Unit tests for personalization service."""
import pytest
from datetime import datetime
from src.personalization_engine.personalization_service import PersonalizationService
from src.personalization_engine.learning_engine import LearningEngine
from src.personalization_engine.models import UserEntry, UserProfile


class TestPersonalizationService:
    """Tests for PersonalizationService class."""
    
    @pytest.fixture
    def service(self):
        """Create a PersonalizationService instance."""
        engine = LearningEngine()
        return PersonalizationService(engine)
    
    @pytest.fixture
    def sample_profile(self):
        """Create a sample user profile."""
        profile = UserProfile(user_id="user123")
        
        for i in range(10):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="happy" if i % 2 == 0 else "sad",
                activities=["exercise", "reading"],
                energy_level=7 if i % 2 == 0 else 3,
                sleep_hours=8.0
            )
            profile.add_entry(entry)
        
        return profile
    
    def test_recommendations_for_new_user(self, service):
        """Test recommendations for a new user with no entries."""
        profile = UserProfile(user_id="new_user")
        recommendations = service.generate_recommendations(profile)
        
        assert len(recommendations) > 0
        assert any('welcome' in rec.content.lower() for rec in recommendations)
    
    def test_generate_recommendations(self, service, sample_profile):
        """Test generating recommendations for existing user."""
        recommendations = service.generate_recommendations(sample_profile)
        
        assert len(recommendations) > 0
        assert all(hasattr(rec, 'recommendation_type') for rec in recommendations)
        assert all(hasattr(rec, 'content') for rec in recommendations)
        assert all(hasattr(rec, 'priority') for rec in recommendations)
    
    def test_recommendations_sorted_by_priority(self, service, sample_profile):
        """Test that recommendations are sorted by priority."""
        recommendations = service.generate_recommendations(sample_profile)
        
        # Check that priorities are in descending order
        for i in range(len(recommendations) - 1):
            assert recommendations[i].priority >= recommendations[i + 1].priority
    
    def test_mood_based_recommendations_negative(self, service, sample_profile):
        """Test recommendations for negative mood."""
        recommendations = service.generate_recommendations(
            sample_profile,
            current_mood="sad"
        )
        
        assert len(recommendations) > 0
        # Should have high priority recommendations for negative mood
        assert any(rec.priority >= 4 for rec in recommendations)
    
    def test_mood_based_recommendations_positive(self, service, sample_profile):
        """Test recommendations for positive mood."""
        recommendations = service.generate_recommendations(
            sample_profile,
            current_mood="happy"
        )
        
        assert len(recommendations) > 0
    
    def test_context_aware_recommendations(self, service, sample_profile):
        """Test that recommendations include context."""
        recommendations = service.generate_recommendations(
            sample_profile,
            current_mood="anxious",
            context={"time_of_day": "evening"}
        )
        
        assert len(recommendations) > 0
        # Check that recommendations have context
        assert any(rec.context for rec in recommendations)
    
    def test_activity_recommendations(self, service):
        """Test activity-based recommendations."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with exercise correlating to happy mood
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="happy",
                activities=["exercise", "meditation"]
            )
            profile.add_entry(entry)
        
        # Add entries with social media correlating to sad mood
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="sad",
                activities=["social_media"]
            )
            profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(profile)
        
        # Should recommend positive activities
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "exercise" in content_str or "meditation" in content_str
    
    def test_declining_trend_recommendation(self, service):
        """Test recommendation when mood is declining."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with declining mood
        moods = ["happy", "happy", "neutral", "neutral", "sad", "sad", "very_sad"]
        for mood in moods:
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood=mood,
                activities=["work"]
            )
            profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(profile)
        
        # Should mention declining trend
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "declining" in content_str or "better" in content_str
    
    def test_improving_trend_recommendation(self, service):
        """Test recommendation when mood is improving."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with improving mood
        moods = ["sad", "sad", "neutral", "neutral", "happy", "happy", "very_happy"]
        for mood in moods:
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood=mood,
                activities=["exercise"]
            )
            profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(profile)
        
        # Should mention improvement
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "improving" in content_str or "great" in content_str or "keep" in content_str
    
    def test_sleep_recommendation(self, service):
        """Test sleep-related recommendations."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with low sleep
        for i in range(7):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="tired",
                energy_level=3,
                sleep_hours=5.0
            )
            profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(profile)
        
        # Should recommend better sleep
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "sleep" in content_str
    
    def test_energy_recommendation(self, service, sample_profile):
        """Test energy-level recommendations."""
        # Add a recent low energy entry
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="tired",
            energy_level=2
        )
        sample_profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(sample_profile)
        
        # Should recommend energy-boosting activities
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "energy" in content_str or "recharge" in content_str
    
    def test_get_daily_summary(self, service, sample_profile):
        """Test getting daily summary."""
        summary = service.get_daily_summary(sample_profile)
        
        assert 'total_entries' in summary
        assert 'metrics' in summary
        assert 'recent_mood_trend' in summary
        assert 'insights' in summary
        assert 'streak_days' in summary
        assert 'timestamp' in summary
        
        assert summary['total_entries'] > 0
        assert summary['recent_mood_trend'] in ["improving", "declining", "stable", "neutral"]
    
    def test_recommendation_limit(self, service, sample_profile):
        """Test that recommendations are limited to top 5."""
        recommendations = service.generate_recommendations(sample_profile)
        
        assert len(recommendations) <= 5
    
    def test_consistency_reminder(self, service):
        """Test reminder for low consistency."""
        profile = UserProfile(user_id="user123")
        
        # Add only 2 entries (low consistency)
        for i in range(2):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="neutral"
            )
            profile.add_entry(entry)
        
        recommendations = service.generate_recommendations(profile)
        
        # Should have consistency reminder
        content_str = " ".join([rec.content.lower() for rec in recommendations])
        assert "log" in content_str or "daily" in content_str or "regular" in content_str
