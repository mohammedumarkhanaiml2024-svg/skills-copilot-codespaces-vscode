#!/usr/bin/env python
"""
Example usage of the AI-Powered Personalization Engine.

This script shows practical examples of how to use the engine
in real-world scenarios.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from personalization_engine import PersonalizationEngine


def example_1_daily_logging():
    """Example 1: Daily mood and activity logging."""
    print("\n=== Example 1: Daily Logging ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    user_id = "alice"
    
    # Create user if not exists
    if not engine.storage.user_exists(user_id):
        engine.create_user(user_id)
        print(f"✓ Created user: {user_id}")
    
    # Log today's entry
    entry = engine.log_entry(
        user_id=user_id,
        mood="happy",
        activities=["morning_run", "work", "meditation"],
        energy_level=8,
        sleep_hours=7.5,
        notes="Productive day with good balance",
        tags=["productive", "balanced"]
    )
    
    print(f"✓ Logged entry:")
    print(f"  Mood: {entry.mood}")
    print(f"  Energy: {entry.energy_level}/10")
    print(f"  Activities: {', '.join(entry.activities)}")
    print(f"  Sleep: {entry.sleep_hours} hours")


def example_2_getting_recommendations():
    """Example 2: Getting personalized recommendations."""
    print("\n=== Example 2: Getting Recommendations ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    user_id = "alice"
    
    # Add some history first
    if engine.storage.user_exists(user_id):
        profile = engine.get_user_profile(user_id)
        if len(profile.entries) < 5:
            # Add more sample data
            sample_entries = [
                {"mood": "energetic", "activities": ["exercise", "work"], "energy_level": 9},
                {"mood": "calm", "activities": ["reading", "meditation"], "energy_level": 7},
                {"mood": "tired", "activities": ["work"], "energy_level": 4},
                {"mood": "happy", "activities": ["exercise", "social"], "energy_level": 8},
            ]
            for data in sample_entries:
                engine.log_entry(user_id=user_id, **data)
    
    # Get recommendations based on current mood
    print("Getting recommendations for someone feeling 'stressed'...\n")
    recommendations = engine.get_recommendations(
        user_id=user_id,
        current_mood="stressed"
    )
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. [{rec.recommendation_type.upper()}] Priority: {rec.priority}/5")
        print(f"   {rec.content}")
        if rec.context:
            print(f"   Context: {rec.context}")
        print()


def example_3_analyzing_patterns():
    """Example 3: Analyzing patterns and getting insights."""
    print("\n=== Example 3: Analyzing Patterns ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    user_id = "alice"
    
    # Get comprehensive insights
    insights = engine.get_insights(user_id)
    
    print(f"📊 Analysis for {user_id}:")
    print(f"\nTotal entries logged: {insights['total_entries']}")
    
    print("\nMood distribution:")
    for mood, count in insights['mood_distribution'].items():
        percentage = (count / insights['total_entries']) * 100
        bar = "█" * int(percentage / 5)
        print(f"  {mood:12s}: {bar} {percentage:.1f}%")
    
    print(f"\nMost common activities:")
    for i, activity in enumerate(insights['common_activities'][:5], 1):
        print(f"  {i}. {activity}")
    
    print(f"\nAverages:")
    print(f"  Energy level: {insights['average_energy']:.1f}/10")
    print(f"  Sleep hours: {insights['average_sleep']:.1f}")
    
    if insights['insights']:
        print(f"\n💡 Key insights:")
        for insight in insights['insights']:
            print(f"  • {insight}")


def example_4_tracking_progress():
    """Example 4: Tracking progress with daily summary."""
    print("\n=== Example 4: Tracking Progress ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    user_id = "alice"
    
    summary = engine.get_summary(user_id)
    
    print(f"📈 Daily Summary for {user_id}")
    print(f"\nStreak: {summary['streak_days']} days")
    print(f"Total entries: {summary['total_entries']}")
    print(f"Mood trend: {summary['recent_mood_trend']}")
    
    metrics = summary['metrics']
    print(f"\nYour Scores:")
    print(f"  Consistency: {metrics['consistency_score']:.0f}/100")
    print(f"  Well-being: {metrics['well_being_score']:.0f}/100")
    print(f"  Activity diversity: {metrics['activity_diversity']} activities")
    
    # Visual representation
    def score_bar(score):
        filled = int(score / 10)
        empty = 10 - filled
        return "█" * filled + "░" * empty
    
    print(f"\n  Consistency: [{score_bar(metrics['consistency_score'])}]")
    print(f"  Well-being:  [{score_bar(metrics['well_being_score'])}]")


def example_5_activity_impact():
    """Example 5: Understanding activity impact on mood."""
    print("\n=== Example 5: Activity Impact Analysis ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    user_id = "alice"
    
    profile = engine.get_user_profile(user_id)
    correlations = engine.learning_engine.find_activity_mood_correlations(profile)
    
    print("Activity-Mood Correlations:")
    print("(Positive = improves mood, Negative = lowers mood)\n")
    
    # Sort by correlation score
    sorted_activities = sorted(
        correlations.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    for activity, score in sorted_activities:
        if score > 0.5:
            emoji = "😊"
            label = "Mood booster"
        elif score < -0.5:
            emoji = "😔"
            label = "Watch out"
        else:
            emoji = "😐"
            label = "Neutral"
        
        print(f"  {emoji} {activity:20s}: {score:+.2f} ({label})")


def example_6_multi_user():
    """Example 6: Managing multiple users."""
    print("\n=== Example 6: Multi-User Support ===\n")
    
    engine = PersonalizationEngine(data_dir="/tmp/example_data")
    
    users = ["alice", "bob", "charlie"]
    
    for user in users:
        if not engine.storage.user_exists(user):
            engine.create_user(user)
        
        # Log a sample entry
        engine.log_entry(
            user_id=user,
            mood="happy" if user == "alice" else "neutral",
            activities=["work"],
            energy_level=7
        )
        
        profile = engine.get_user_profile(user)
        print(f"✓ {user}: {len(profile.entries)} entries")


def main():
    """Run all examples."""
    print("\n" + "=" * 70)
    print("  AI-POWERED PERSONALIZATION ENGINE - EXAMPLES")
    print("=" * 70)
    
    try:
        example_1_daily_logging()
        example_2_getting_recommendations()
        example_3_analyzing_patterns()
        example_4_tracking_progress()
        example_5_activity_impact()
        example_6_multi_user()
        
        print("\n" + "=" * 70)
        print("  All examples completed! ✓")
        print("=" * 70 + "\n")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
