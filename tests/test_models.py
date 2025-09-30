"""Unit tests for data models."""
import pytest
from datetime import datetime
from src.personalization_engine.models import (
    UserEntry, UserProfile, Recommendation, MoodType
)


class TestUserEntry:
    """Tests for UserEntry model."""
    
    def test_create_entry(self):
        """Test creating a basic user entry."""
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy",
            activities=["exercise", "reading"],
            energy_level=7,
            sleep_hours=8.0,
            notes="Great day!",
            tags=["productive"]
        )
        
        assert entry.mood == "happy"
        assert len(entry.activities) == 2
        assert entry.energy_level == 7
        assert entry.sleep_hours == 8.0
        assert entry.notes == "Great day!"
        assert "productive" in entry.tags
    
    def test_entry_to_dict(self):
        """Test converting entry to dictionary."""
        entry = UserEntry(
            timestamp="2024-01-01T10:00:00",
            mood="happy",
            activities=["exercise"]
        )
        
        entry_dict = entry.to_dict()
        assert entry_dict["mood"] == "happy"
        assert entry_dict["activities"] == ["exercise"]
        assert "timestamp" in entry_dict
    
    def test_entry_from_dict(self):
        """Test creating entry from dictionary."""
        data = {
            "timestamp": "2024-01-01T10:00:00",
            "mood": "happy",
            "activities": ["exercise"],
            "energy_level": 7,
            "sleep_hours": 8.0,
            "notes": "test",
            "tags": ["test"]
        }
        
        entry = UserEntry.from_dict(data)
        assert entry.mood == "happy"
        assert entry.activities == ["exercise"]
        assert entry.energy_level == 7
    
    def test_entry_default_values(self):
        """Test entry with default values."""
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="neutral"
        )
        
        assert entry.activities == []
        assert entry.energy_level == 5
        assert entry.sleep_hours is None
        assert entry.notes == ""
        assert entry.tags == []


class TestUserProfile:
    """Tests for UserProfile model."""
    
    def test_create_profile(self):
        """Test creating a user profile."""
        profile = UserProfile(user_id="user123")
        
        assert profile.user_id == "user123"
        assert len(profile.entries) == 0
        assert profile.preferences == {}
        assert profile.created_at is not None
    
    def test_add_entry(self):
        """Test adding entries to profile."""
        profile = UserProfile(user_id="user123")
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy"
        )
        
        profile.add_entry(entry)
        assert len(profile.entries) == 1
        assert profile.entries[0].mood == "happy"
    
    def test_get_recent_entries(self):
        """Test getting recent entries."""
        profile = UserProfile(user_id="user123")
        
        # Add 15 entries
        for i in range(15):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="happy" if i % 2 == 0 else "sad"
            )
            profile.add_entry(entry)
        
        recent = profile.get_recent_entries(10)
        assert len(recent) == 10
        
        # Test with fewer entries than requested
        profile2 = UserProfile(user_id="user456")
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="neutral"
            )
            profile2.add_entry(entry)
        
        recent2 = profile2.get_recent_entries(10)
        assert len(recent2) == 5
    
    def test_profile_to_dict(self):
        """Test converting profile to dictionary."""
        profile = UserProfile(user_id="user123")
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy"
        )
        profile.add_entry(entry)
        
        profile_dict = profile.to_dict()
        assert profile_dict["user_id"] == "user123"
        assert len(profile_dict["entries"]) == 1
        assert "created_at" in profile_dict
    
    def test_profile_from_dict(self):
        """Test creating profile from dictionary."""
        data = {
            "user_id": "user123",
            "entries": [
                {
                    "timestamp": "2024-01-01T10:00:00",
                    "mood": "happy",
                    "activities": [],
                    "energy_level": 5,
                    "sleep_hours": None,
                    "notes": "",
                    "tags": []
                }
            ],
            "preferences": {"theme": "dark"},
            "created_at": "2024-01-01T00:00:00"
        }
        
        profile = UserProfile.from_dict(data)
        assert profile.user_id == "user123"
        assert len(profile.entries) == 1
        assert profile.preferences["theme"] == "dark"


class TestRecommendation:
    """Tests for Recommendation model."""
    
    def test_create_recommendation(self):
        """Test creating a recommendation."""
        rec = Recommendation(
            recommendation_type="advice",
            content="Take a break",
            priority=3,
            context={"reason": "high_stress"}
        )
        
        assert rec.recommendation_type == "advice"
        assert rec.content == "Take a break"
        assert rec.priority == 3
        assert rec.context["reason"] == "high_stress"
        assert rec.timestamp is not None
    
    def test_recommendation_default_values(self):
        """Test recommendation with default values."""
        rec = Recommendation(
            recommendation_type="reminder",
            content="Log your mood"
        )
        
        assert rec.priority == 1
        assert rec.context == {}
    
    def test_recommendation_to_dict(self):
        """Test converting recommendation to dictionary."""
        rec = Recommendation(
            recommendation_type="advice",
            content="Test"
        )
        
        rec_dict = rec.to_dict()
        assert rec_dict["recommendation_type"] == "advice"
        assert rec_dict["content"] == "Test"
        assert "timestamp" in rec_dict


class TestMoodType:
    """Tests for MoodType enum."""
    
    def test_mood_types_exist(self):
        """Test that mood types are properly defined."""
        assert MoodType.HAPPY.value == "happy"
        assert MoodType.SAD.value == "sad"
        assert MoodType.ANXIOUS.value == "anxious"
        assert MoodType.ENERGETIC.value == "energetic"
        assert MoodType.CALM.value == "calm"
