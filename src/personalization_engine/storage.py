"""
Data storage layer for user profiles and entries.
"""
import json
import os
from typing import Optional
from pathlib import Path
from .models import UserProfile, UserEntry


class DataStorage:
    """Handles persistence of user data."""
    
    def __init__(self, data_dir: str = "data/user_data"):
        """Initialize storage with data directory."""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_user_file_path(self, user_id: str) -> Path:
        """Get the file path for a user's data."""
        return self.data_dir / f"{user_id}.json"
    
    def save_user_profile(self, profile: UserProfile) -> None:
        """Save user profile to disk."""
        file_path = self._get_user_file_path(profile.user_id)
        with open(file_path, 'w') as f:
            json.dump(profile.to_dict(), f, indent=2)
    
    def load_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Load user profile from disk."""
        file_path = self._get_user_file_path(user_id)
        if not file_path.exists():
            return None
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return UserProfile.from_dict(data)
    
    def user_exists(self, user_id: str) -> bool:
        """Check if a user profile exists."""
        return self._get_user_file_path(user_id).exists()
    
    def create_user_profile(self, user_id: str) -> UserProfile:
        """Create a new user profile."""
        profile = UserProfile(user_id=user_id)
        self.save_user_profile(profile)
        return profile
    
    def add_entry(self, user_id: str, entry: UserEntry) -> None:
        """Add an entry to a user's profile."""
        profile = self.load_user_profile(user_id)
        if profile is None:
            profile = self.create_user_profile(user_id)
        
        profile.add_entry(entry)
        self.save_user_profile(profile)
