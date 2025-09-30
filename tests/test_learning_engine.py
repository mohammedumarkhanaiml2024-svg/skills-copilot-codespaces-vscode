"""Unit tests for learning engine."""
import pytest
from datetime import datetime, timedelta
from src.personalization_engine.learning_engine import LearningEngine
from src.personalization_engine.models import UserEntry, UserProfile


class TestLearningEngine:
    """Tests for LearningEngine class."""
    
    @pytest.fixture
    def engine(self):
        """Create a LearningEngine instance."""
        return LearningEngine()
    
    @pytest.fixture
    def sample_profile(self):
        """Create a sample user profile with entries."""
        profile = UserProfile(user_id="user123")
        
        moods = ["happy", "sad", "energetic", "tired", "neutral"]
        activities = ["exercise", "reading", "work", "meditation"]
        
        for i in range(10):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood=moods[i % len(moods)],
                activities=[activities[i % len(activities)]],
                energy_level=5 + (i % 5),
                sleep_hours=7.0 + (i % 3)
            )
            profile.add_entry(entry)
        
        return profile
    
    def test_analyze_empty_profile(self, engine):
        """Test analyzing an empty profile."""
        profile = UserProfile(user_id="user123")
        analysis = engine.analyze_patterns(profile)
        
        assert analysis['total_entries'] == 0
        assert analysis['mood_distribution'] == {}
        assert analysis['common_activities'] == []
        assert analysis['average_energy'] == 0
        assert analysis['average_sleep'] == 0
    
    def test_analyze_patterns(self, engine, sample_profile):
        """Test pattern analysis with sample data."""
        analysis = engine.analyze_patterns(sample_profile)
        
        assert analysis['total_entries'] == 10
        assert len(analysis['mood_distribution']) > 0
        assert len(analysis['common_activities']) > 0
        assert analysis['average_energy'] > 0
        assert analysis['average_sleep'] > 0
        assert isinstance(analysis['insights'], list)
    
    def test_mood_distribution(self, engine, sample_profile):
        """Test mood distribution calculation."""
        analysis = engine.analyze_patterns(sample_profile)
        mood_dist = analysis['mood_distribution']
        
        # Check that moods are counted
        assert 'happy' in mood_dist or any(mood in mood_dist for mood in ['sad', 'energetic', 'tired', 'neutral'])
        
        # Check total counts match
        total_moods = sum(mood_dist.values())
        assert total_moods == 10
    
    def test_common_activities(self, engine, sample_profile):
        """Test common activities extraction."""
        analysis = engine.analyze_patterns(sample_profile)
        common_activities = analysis['common_activities']
        
        assert len(common_activities) > 0
        # Activities should be from our sample set
        for activity in common_activities:
            assert activity in ["exercise", "reading", "work", "meditation"]
    
    def test_energy_analysis(self, engine):
        """Test energy level analysis."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with low energy
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="tired",
                energy_level=3
            )
            profile.add_entry(entry)
        
        analysis = engine.analyze_patterns(profile)
        assert analysis['average_energy'] == 3.0
        
        # Check for low energy insight
        insights = analysis['insights']
        assert any('energy' in insight.lower() for insight in insights)
    
    def test_sleep_analysis(self, engine):
        """Test sleep hours analysis."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with low sleep
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="tired",
                sleep_hours=5.0
            )
            profile.add_entry(entry)
        
        analysis = engine.analyze_patterns(profile)
        assert analysis['average_sleep'] == 5.0
        
        # Check for sleep insight
        insights = analysis['insights']
        assert any('sleep' in insight.lower() for insight in insights)
    
    def test_predict_mood_trend_insufficient_data(self, engine):
        """Test mood trend prediction with insufficient data."""
        profile = UserProfile(user_id="user123")
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy"
        )
        profile.add_entry(entry)
        
        trend = engine.predict_mood_trend(profile)
        assert trend == "neutral"
    
    def test_predict_mood_trend_improving(self, engine):
        """Test detecting improving mood trend."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with improving mood
        moods = ["sad", "sad", "neutral", "neutral", "happy", "happy", "very_happy"]
        for mood in moods:
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood=mood
            )
            profile.add_entry(entry)
        
        trend = engine.predict_mood_trend(profile)
        assert trend in ["improving", "stable"]
    
    def test_predict_mood_trend_declining(self, engine):
        """Test detecting declining mood trend."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with declining mood
        moods = ["very_happy", "happy", "happy", "neutral", "neutral", "sad", "sad"]
        for mood in moods:
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood=mood
            )
            profile.add_entry(entry)
        
        trend = engine.predict_mood_trend(profile)
        assert trend in ["declining", "stable"]
    
    def test_find_activity_mood_correlations(self, engine):
        """Test finding correlations between activities and moods."""
        profile = UserProfile(user_id="user123")
        
        # Add entries where exercise correlates with happy mood
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="happy",
                activities=["exercise"]
            )
            profile.add_entry(entry)
        
        # Add entries where work correlates with stressed mood
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="stressed",
                activities=["work"]
            )
            profile.add_entry(entry)
        
        correlations = engine.find_activity_mood_correlations(profile)
        
        assert "exercise" in correlations
        assert "work" in correlations
        assert correlations["exercise"] > correlations["work"]
    
    def test_get_personalized_metrics(self, engine, sample_profile):
        """Test personalized metrics calculation."""
        metrics = engine.get_personalized_metrics(sample_profile)
        
        assert 'consistency_score' in metrics
        assert 'well_being_score' in metrics
        assert 'activity_diversity' in metrics
        
        assert 0 <= metrics['consistency_score'] <= 100
        assert 0 <= metrics['well_being_score'] <= 100
        assert metrics['activity_diversity'] >= 0
    
    def test_metrics_with_empty_profile(self, engine):
        """Test metrics with empty profile."""
        profile = UserProfile(user_id="user123")
        metrics = engine.get_personalized_metrics(profile)
        
        assert metrics['consistency_score'] == 0
        assert metrics['well_being_score'] == 0
        assert metrics['activity_diversity'] == 0
    
    def test_insights_generation(self, engine):
        """Test that insights are generated appropriately."""
        profile = UserProfile(user_id="user123")
        
        # Add entries with various characteristics
        for i in range(10):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="sad" if i % 2 == 0 else "anxious",
                energy_level=3,
                sleep_hours=5.0
            )
            profile.add_entry(entry)
        
        analysis = engine.analyze_patterns(profile)
        insights = analysis['insights']
        
        assert len(insights) > 0
        # Should have insights about energy, sleep, and mood
        assert any('energy' in insight.lower() or 'sleep' in insight.lower() or 'mood' in insight.lower() 
                   for insight in insights)
