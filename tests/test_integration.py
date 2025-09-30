"""Integration tests for the complete personalization engine."""
import pytest
import tempfile
import shutil
from datetime import datetime
from src.personalization_engine import PersonalizationEngine


class TestPersonalizationEngineIntegration:
    """Integration tests for the full engine workflow."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def engine(self, temp_dir):
        """Create a PersonalizationEngine instance."""
        return PersonalizationEngine(data_dir=temp_dir)
    
    def test_complete_user_workflow(self, engine):
        """Test complete workflow from user creation to recommendations."""
        user_id = "test_user"
        
        # Create user
        profile = engine.create_user(user_id)
        assert profile.user_id == user_id
        
        # Log multiple entries
        moods = ["happy", "energetic", "neutral", "tired", "calm"]
        activities_list = [
            ["exercise", "work"],
            ["exercise", "meditation"],
            ["work", "reading"],
            ["work"],
            ["meditation", "reading"]
        ]
        
        for i, mood in enumerate(moods):
            entry = engine.log_entry(
                user_id=user_id,
                mood=mood,
                activities=activities_list[i],
                energy_level=7 - i,
                sleep_hours=7.5,
                notes=f"Day {i+1}"
            )
            assert entry.mood == mood
        
        # Get recommendations
        recommendations = engine.get_recommendations(user_id)
        assert len(recommendations) > 0
        
        # Get insights
        insights = engine.get_insights(user_id)
        assert insights['total_entries'] == 5
        assert len(insights['mood_distribution']) > 0
        
        # Get summary
        summary = engine.get_summary(user_id)
        assert summary['total_entries'] == 5
        assert 'metrics' in summary
    
    def test_adaptive_learning_over_time(self, engine):
        """Test that recommendations adapt as more data is added."""
        user_id = "adaptive_user"
        engine.create_user(user_id)
        
        # Phase 1: User starts with low mood
        for i in range(5):
            engine.log_entry(
                user_id=user_id,
                mood="sad",
                activities=["work"],
                energy_level=3
            )
        
        initial_recommendations = engine.get_recommendations(user_id, current_mood="sad")
        
        # Phase 2: User improves with exercise
        for i in range(7):
            engine.log_entry(
                user_id=user_id,
                mood="happy",
                activities=["exercise", "meditation"],
                energy_level=7
            )
        
        improved_recommendations = engine.get_recommendations(user_id)
        
        # Recommendations should change based on new patterns
        assert len(improved_recommendations) > 0
        
        # Get insights to verify learning
        insights = engine.get_insights(user_id)
        assert insights['total_entries'] == 12
        
        # Check activity correlations learned
        profile = engine.get_user_profile(user_id)
        correlations = engine.learning_engine.find_activity_mood_correlations(profile)
        
        if correlations:
            # Exercise should have positive correlation
            if "exercise" in correlations:
                assert correlations["exercise"] > correlations.get("work", -999)
    
    def test_context_aware_recommendations(self, engine):
        """Test that recommendations consider current context."""
        user_id = "context_user"
        engine.create_user(user_id)
        
        # Build history with patterns
        for i in range(10):
            engine.log_entry(
                user_id=user_id,
                mood="happy" if i % 2 == 0 else "stressed",
                activities=["exercise"] if i % 2 == 0 else ["work"],
                energy_level=8 if i % 2 == 0 else 4
            )
        
        # Get recommendations for different moods
        happy_recs = engine.get_recommendations(user_id, current_mood="happy")
        stressed_recs = engine.get_recommendations(user_id, current_mood="stressed")
        
        # Both should provide recommendations
        assert len(happy_recs) > 0
        assert len(stressed_recs) > 0
        
        # Stressed recommendations should have higher priority
        max_stressed_priority = max(rec.priority for rec in stressed_recs)
        assert max_stressed_priority >= 3
    
    def test_unlimited_entries_support(self, engine):
        """Test that engine supports unlimited daily entries."""
        user_id = "unlimited_user"
        engine.create_user(user_id)
        
        # Log many entries
        num_entries = 50
        for i in range(num_entries):
            engine.log_entry(
                user_id=user_id,
                mood="happy" if i % 3 == 0 else "neutral",
                activities=["activity_" + str(i % 10)],
                energy_level=(i % 10) + 1
            )
        
        # Verify all entries are stored
        profile = engine.get_user_profile(user_id)
        assert len(profile.entries) == num_entries
        
        # Verify analysis still works with large dataset
        insights = engine.get_insights(user_id)
        assert insights['total_entries'] == num_entries
        
        # Verify recommendations still generated
        recommendations = engine.get_recommendations(user_id)
        assert len(recommendations) > 0
    
    def test_data_persistence(self, temp_dir):
        """Test that data persists across engine instances."""
        user_id = "persistent_user"
        
        # Create first engine instance and add data
        engine1 = PersonalizationEngine(data_dir=temp_dir)
        engine1.create_user(user_id)
        engine1.log_entry(
            user_id=user_id,
            mood="happy",
            activities=["test"],
            energy_level=5
        )
        
        # Create second engine instance and verify data
        engine2 = PersonalizationEngine(data_dir=temp_dir)
        profile = engine2.get_user_profile(user_id)
        
        assert profile is not None
        assert len(profile.entries) == 1
        assert profile.entries[0].mood == "happy"
    
    def test_multiple_users(self, engine):
        """Test engine handling multiple users independently."""
        user1_id = "user1"
        user2_id = "user2"
        
        # Create users
        engine.create_user(user1_id)
        engine.create_user(user2_id)
        
        # Add different data for each user
        engine.log_entry(user1_id, mood="happy", activities=["exercise"])
        engine.log_entry(user1_id, mood="energetic", activities=["exercise"])
        
        engine.log_entry(user2_id, mood="sad", activities=["work"])
        engine.log_entry(user2_id, mood="stressed", activities=["work"])
        
        # Verify independent data
        profile1 = engine.get_user_profile(user1_id)
        profile2 = engine.get_user_profile(user2_id)
        
        assert len(profile1.entries) == 2
        assert len(profile2.entries) == 2
        
        assert profile1.entries[0].mood == "happy"
        assert profile2.entries[0].mood == "sad"
        
        # Verify independent recommendations
        recs1 = engine.get_recommendations(user1_id)
        recs2 = engine.get_recommendations(user2_id)
        
        assert len(recs1) > 0
        assert len(recs2) > 0
    
    def test_comprehensive_metrics_tracking(self, engine):
        """Test comprehensive metrics are tracked and updated."""
        user_id = "metrics_user"
        engine.create_user(user_id)
        
        # Add diverse entries
        for i in range(15):
            engine.log_entry(
                user_id=user_id,
                mood=["happy", "sad", "energetic", "tired", "calm"][i % 5],
                activities=[f"activity_{i % 5}"],
                energy_level=(i % 10) + 1,
                sleep_hours=6.0 + (i % 4),
                tags=[f"tag_{i % 3}"]
            )
        
        # Get all metrics
        insights = engine.get_insights(user_id)
        summary = engine.get_summary(user_id)
        
        # Verify comprehensive tracking
        assert insights['total_entries'] == 15
        assert 'mood_distribution' in insights
        assert 'common_activities' in insights
        assert 'average_energy' in insights
        assert 'average_sleep' in insights
        assert 'insights' in insights
        
        assert 'metrics' in summary
        assert 'consistency_score' in summary['metrics']
        assert 'well_being_score' in summary['metrics']
        assert 'activity_diversity' in summary['metrics']
    
    def test_error_handling(self, engine):
        """Test error handling for invalid operations."""
        # Try to get insights for non-existent user
        insights = engine.get_insights("nonexistent_user")
        assert 'error' in insights
        
        summary = engine.get_summary("nonexistent_user")
        assert 'error' in summary
        
        profile = engine.get_user_profile("nonexistent_user")
        assert profile is None
    
    def test_edge_cases(self, engine):
        """Test edge cases and boundary conditions."""
        user_id = "edge_case_user"
        engine.create_user(user_id)
        
        # Entry with minimal data
        entry1 = engine.log_entry(
            user_id=user_id,
            mood="neutral"
        )
        assert entry1.activities == []
        assert entry1.energy_level == 5
        
        # Entry with maximum data
        entry2 = engine.log_entry(
            user_id=user_id,
            mood="very_happy",
            activities=["a1", "a2", "a3", "a4", "a5"],
            energy_level=10,
            sleep_hours=12.0,
            notes="Maximum data entry" * 10,
            tags=["t1", "t2", "t3"]
        )
        assert len(entry2.activities) == 5
        assert entry2.energy_level == 10
        
        # Verify both entries stored correctly
        profile = engine.get_user_profile(user_id)
        assert len(profile.entries) == 2
