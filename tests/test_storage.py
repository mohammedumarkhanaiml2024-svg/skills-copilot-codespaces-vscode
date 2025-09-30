"""Unit tests for data storage."""
import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from src.personalization_engine.storage import DataStorage
from src.personalization_engine.models import UserEntry, UserProfile


class TestDataStorage:
    """Tests for DataStorage class."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def storage(self, temp_dir):
        """Create a DataStorage instance with temp directory."""
        return DataStorage(temp_dir)
    
    def test_storage_initialization(self, temp_dir):
        """Test storage initialization creates directory."""
        storage = DataStorage(temp_dir)
        assert storage.data_dir.exists()
        assert storage.data_dir.is_dir()
    
    def test_create_user_profile(self, storage):
        """Test creating a new user profile."""
        profile = storage.create_user_profile("user123")
        
        assert profile.user_id == "user123"
        assert len(profile.entries) == 0
        assert storage.user_exists("user123")
    
    def test_save_and_load_profile(self, storage):
        """Test saving and loading a user profile."""
        # Create and save profile
        profile = UserProfile(user_id="user123")
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy",
            activities=["exercise"]
        )
        profile.add_entry(entry)
        
        storage.save_user_profile(profile)
        
        # Load profile
        loaded_profile = storage.load_user_profile("user123")
        
        assert loaded_profile is not None
        assert loaded_profile.user_id == "user123"
        assert len(loaded_profile.entries) == 1
        assert loaded_profile.entries[0].mood == "happy"
    
    def test_load_nonexistent_profile(self, storage):
        """Test loading a profile that doesn't exist."""
        profile = storage.load_user_profile("nonexistent")
        assert profile is None
    
    def test_user_exists(self, storage):
        """Test checking if user exists."""
        assert not storage.user_exists("user123")
        
        storage.create_user_profile("user123")
        assert storage.user_exists("user123")
    
    def test_add_entry(self, storage):
        """Test adding an entry to user profile."""
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy",
            activities=["reading"]
        )
        
        storage.add_entry("user123", entry)
        
        profile = storage.load_user_profile("user123")
        assert profile is not None
        assert len(profile.entries) == 1
        assert profile.entries[0].mood == "happy"
    
    def test_add_multiple_entries(self, storage):
        """Test adding multiple entries."""
        for i in range(5):
            entry = UserEntry(
                timestamp=datetime.utcnow().isoformat(),
                mood="happy" if i % 2 == 0 else "sad",
                activities=["activity" + str(i)]
            )
            storage.add_entry("user123", entry)
        
        profile = storage.load_user_profile("user123")
        assert len(profile.entries) == 5
    
    def test_persistence_across_instances(self, temp_dir):
        """Test that data persists across storage instances."""
        # Create first instance and save data
        storage1 = DataStorage(temp_dir)
        storage1.create_user_profile("user123")
        entry = UserEntry(
            timestamp=datetime.utcnow().isoformat(),
            mood="happy"
        )
        storage1.add_entry("user123", entry)
        
        # Create second instance and load data
        storage2 = DataStorage(temp_dir)
        profile = storage2.load_user_profile("user123")
        
        assert profile is not None
        assert len(profile.entries) == 1
