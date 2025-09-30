# AI-Powered Personalization Engine

A comprehensive AI/ML system that learns from user habits, moods, routines, and activities to provide personalized guidance, recommendations, and insights that adapt over time.

## 🌟 Features

- **Unlimited Daily Entries**: Log unlimited moods, activities, routines, energy levels, and sleep data
- **Adaptive Learning**: AI engine that evolves recommendations as user data grows
- **Context-Aware Guidance**: Personalized advice considering current mood and recent activity
- **Pattern Analysis**: Discovers correlations between activities and mood states
- **Progress Tracking**: Comprehensive metrics including consistency, well-being, and activity diversity
- **Data Persistence**: Secure JSON-based storage for all user data
- **Comprehensive Testing**: 57 unit and integration tests ensuring reliability

## 📋 Requirements

- Python 3.8+
- NumPy >= 1.24.0
- scikit-learn >= 1.3.0

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Basic Usage

```python
from src.personalization_engine import PersonalizationEngine

# Initialize the engine
engine = PersonalizationEngine()

# Create a user
user_id = "user123"
engine.create_user(user_id)

# Log daily entries
engine.log_entry(
    user_id=user_id,
    mood="happy",
    activities=["exercise", "meditation"],
    energy_level=8,
    sleep_hours=7.5,
    notes="Great day!"
)

# Get personalized recommendations
recommendations = engine.get_recommendations(user_id, current_mood="stressed")
for rec in recommendations:
    print(f"[{rec.recommendation_type}] {rec.content}")

# Get insights and patterns
insights = engine.get_insights(user_id)
print(f"Total entries: {insights['total_entries']}")
print(f"Average energy: {insights['average_energy']}")

# Get daily summary
summary = engine.get_summary(user_id)
print(f"Well-being score: {summary['metrics']['well_being_score']}/100")
```

## 🎯 Core Components

### 1. Data Models (`models.py`)
- **UserEntry**: Represents a single daily entry with mood, activities, energy, sleep
- **UserProfile**: Stores complete user history and preferences
- **Recommendation**: Personalized advice with priority and context
- **MoodType**: Enumeration of supported mood states

### 2. Data Storage (`storage.py`)
- JSON-based persistent storage
- Automatic profile creation and management
- Support for multiple users
- Thread-safe operations

### 3. Learning Engine (`learning_engine.py`)
- **Pattern Analysis**: Discovers trends in mood, energy, and activities
- **Mood Prediction**: Predicts mood trends (improving/declining/stable)
- **Activity Correlations**: Identifies which activities improve mood
- **Personalized Metrics**: Calculates consistency, well-being, and diversity scores
- **Insight Generation**: Provides actionable insights based on data

### 4. Personalization Service (`personalization_service.py`)
- **Context-Aware Recommendations**: Adapts to current mood and situation
- **Priority-Based Guidance**: Ranks recommendations by importance
- **Trend-Based Advice**: Responds to mood trends
- **Activity Suggestions**: Recommends beneficial activities
- **Daily Summaries**: Comprehensive progress reports

## 📊 Example Use Cases

### Scenario 1: Tracking Mood Patterns
```python
engine = PersonalizationEngine()

# Log entries over time
for day in range(30):
    engine.log_entry(
        user_id="user123",
        mood=daily_mood[day],
        activities=daily_activities[day],
        energy_level=energy_levels[day]
    )

# Analyze patterns
insights = engine.get_insights("user123")
print("Mood distribution:", insights['mood_distribution'])
print("Common activities:", insights['common_activities'])
```

### Scenario 2: Getting Help During Difficult Times
```python
# User feeling stressed
recommendations = engine.get_recommendations(
    user_id="user123",
    current_mood="stressed"
)

# Engine provides personalized coping strategies
# based on what has worked in the past
for rec in recommendations:
    if rec.priority >= 4:  # High priority
        print(f"Important: {rec.content}")
```

### Scenario 3: Discovering What Works
```python
profile = engine.get_user_profile("user123")
correlations = engine.learning_engine.find_activity_mood_correlations(profile)

# See which activities boost mood
for activity, score in sorted(correlations.items(), key=lambda x: x[1], reverse=True):
    if score > 0:
        print(f"{activity}: +{score:.2f} mood boost")
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/test_learning_engine.py -v
```

**Test Coverage:**
- ✅ 57 tests covering all components
- ✅ Unit tests for models, storage, learning engine, and service
- ✅ Integration tests for complete workflows
- ✅ Edge cases and error handling

## 🎬 Demo

Run the interactive demo to see all features in action:

```bash
python demo.py
```

The demo showcases:
1. Basic usage and entry logging
2. Personalized recommendations
3. Pattern analysis and insights
4. Adaptive learning over time
5. Daily summaries and metrics

## 🏗️ Architecture

```
personalization_engine/
├── models.py                 # Data structures
├── storage.py               # Persistence layer
├── learning_engine.py       # AI/ML analysis
├── personalization_service.py  # Recommendation engine
└── __init__.py             # Main API interface
```

**Design Principles:**
- **Modularity**: Each component has a single responsibility
- **Extensibility**: Easy to add new mood types, activities, or metrics
- **Privacy**: Data stored locally, no external services required
- **Testability**: Comprehensive test coverage with pytest
- **Simplicity**: Clean API with sensible defaults

## 📈 Metrics Tracked

- **Consistency Score**: How regularly the user logs entries (0-100)
- **Well-being Score**: Overall mood and energy trends (0-100)
- **Activity Diversity**: Number of unique activities tracked
- **Mood Distribution**: Frequency of each mood state
- **Energy Patterns**: Average energy levels over time
- **Sleep Analysis**: Sleep duration and its impact
- **Activity Correlations**: Which activities correlate with positive moods

## 🔒 Privacy & Security

- All data stored locally in JSON files
- No external API calls or data transmission
- User data isolated by user_id
- No personally identifiable information required
- Easy to delete or export data

## 🛣️ Future Enhancements

Potential areas for expansion:
- Time-of-day pattern recognition
- Weather/seasonal correlation analysis
- Goal setting and tracking
- Social activity recommendations
- Export to various formats (CSV, PDF)
- Machine learning model improvements
- Mobile app integration
- Data visualization dashboard

## 📝 License

This project is part of the skills-copilot-codespaces-vscode repository.

## 🤝 Contributing

Contributions are welcome! Areas for contribution:
- Additional test cases
- New mood types or activity categories
- Enhanced ML algorithms
- UI/UX improvements
- Documentation updates

## 📧 Support

For issues or questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using Python, NumPy, and scikit-learn**
