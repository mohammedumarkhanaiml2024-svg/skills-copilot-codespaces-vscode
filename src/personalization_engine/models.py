"""
Data models for the AI-Powered Personalization Engine.
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum


class MoodType(Enum):
    """Enumeration of possible mood types."""
    VERY_HAPPY = "very_happy"
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    VERY_SAD = "very_sad"
    ANXIOUS = "anxious"
    ENERGETIC = "energetic"
    TIRED = "tired"
    STRESSED = "stressed"
    CALM = "calm"


@dataclass
class UserEntry:
    """Represents a single user entry with mood, activities, and context."""
    timestamp: str
    mood: str
    activities: List[str] = field(default_factory=list)
    energy_level: int = 5  # 1-10 scale
    sleep_hours: Optional[float] = None
    notes: str = ""
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert entry to dictionary."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserEntry':
        """Create entry from dictionary."""
        return cls(**data)


@dataclass
class UserProfile:
    """Represents a user's profile with all historical data."""
    user_id: str
    entries: List[UserEntry] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def add_entry(self, entry: UserEntry) -> None:
        """Add a new entry to the user's profile."""
        self.entries.append(entry)
    
    def get_recent_entries(self, count: int = 10) -> List[UserEntry]:
        """Get the most recent entries."""
        return self.entries[-count:] if len(self.entries) >= count else self.entries
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert profile to dictionary."""
        return {
            'user_id': self.user_id,
            'entries': [entry.to_dict() for entry in self.entries],
            'preferences': self.preferences,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserProfile':
        """Create profile from dictionary."""
        entries = [UserEntry.from_dict(entry) for entry in data.get('entries', [])]
        return cls(
            user_id=data['user_id'],
            entries=entries,
            preferences=data.get('preferences', {}),
            created_at=data.get('created_at', datetime.utcnow().isoformat())
        )


@dataclass
class Recommendation:
    """Represents a personalized recommendation."""
    recommendation_type: str  # advice, reminder, activity
    content: str
    priority: int = 1  # 1-5 scale
    context: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert recommendation to dictionary."""
        return asdict(self)
