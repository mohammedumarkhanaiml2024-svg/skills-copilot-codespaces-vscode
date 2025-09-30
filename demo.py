#!/usr/bin/env python
"""
Demo script for the AI-Powered Personalization Engine.

This script demonstrates the key features of the personalization engine:
- Logging user entries
- Getting personalized recommendations
- Analyzing patterns and insights
- Tracking progress over time
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from personalization_engine import PersonalizationEngine
from datetime import datetime


def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def demo_basic_usage():
    """Demonstrate basic usage of the engine."""
    print_section("DEMO 1: Basic Usage")
    
    # Initialize engine
    engine = PersonalizationEngine(data_dir="/tmp/demo_data")
    user_id = "demo_user"
    
    print(f"Creating user: {user_id}")
    engine.create_user(user_id)
    
    # Log some entries
    print("\nLogging daily entries...")
    
    entries_data = [
        {"mood": "happy", "activities": ["exercise", "work"], "energy_level": 8, "sleep_hours": 8.0},
        {"mood": "energetic", "activities": ["exercise", "meditation"], "energy_level": 9, "sleep_hours": 7.5},
        {"mood": "tired", "activities": ["work"], "energy_level": 4, "sleep_hours": 5.0},
        {"mood": "calm", "activities": ["meditation", "reading"], "energy_level": 6, "sleep_hours": 8.0},
        {"mood": "stressed", "activities": ["work"], "energy_level": 3, "sleep_hours": 6.0},
    ]
    
    for i, data in enumerate(entries_data, 1):
        engine.log_entry(user_id=user_id, **data)
        print(f"  Day {i}: Mood={data['mood']}, Energy={data['energy_level']}/10, "
              f"Activities={', '.join(data['activities'])}")
    
    print(f"\n✓ Successfully logged {len(entries_data)} entries")


def demo_recommendations():
    """Demonstrate personalized recommendations."""
    print_section("DEMO 2: Personalized Recommendations")
    
    engine = PersonalizationEngine(data_dir="/tmp/demo_data")
    user_id = "demo_user"
    
    # Get general recommendations
    print("Getting personalized recommendations...\n")
    recommendations = engine.get_recommendations(user_id)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. [{rec.recommendation_type.upper()}] Priority: {rec.priority}/5")
        print(f"   {rec.content}\n")
    
    # Get context-aware recommendations
    print("\nGetting recommendations for current mood: 'stressed'...")
    stressed_recs = engine.get_recommendations(user_id, current_mood="stressed")
    
    print("\nTop recommendation when stressed:")
    if stressed_recs:
        top_rec = stressed_recs[0]
        print(f"[{top_rec.recommendation_type.upper()}] {top_rec.content}")


def demo_insights():
    """Demonstrate pattern analysis and insights."""
    print_section("DEMO 3: Pattern Analysis & Insights")
    
    engine = PersonalizationEngine(data_dir="/tmp/demo_data")
    user_id = "demo_user"
    
    insights = engine.get_insights(user_id)
    
    print(f"Total Entries: {insights['total_entries']}")
    print(f"\nMood Distribution:")
    for mood, count in insights['mood_distribution'].items():
        print(f"  {mood}: {count} times")
    
    print(f"\nCommon Activities:")
    for activity in insights['common_activities']:
        print(f"  • {activity}")
    
    print(f"\nAverage Metrics:")
    print(f"  Energy Level: {insights['average_energy']:.1f}/10")
    print(f"  Sleep Hours: {insights['average_sleep']:.1f}")
    
    if insights['insights']:
        print(f"\nKey Insights:")
        for insight in insights['insights']:
            print(f"  💡 {insight}")


def demo_adaptive_learning():
    """Demonstrate how the AI adapts over time."""
    print_section("DEMO 4: Adaptive Learning")
    
    engine = PersonalizationEngine(data_dir="/tmp/demo_adaptive")
    user_id = "adaptive_user"
    
    engine.create_user(user_id)
    
    print("Phase 1: Initial period with mixed results...")
    for i in range(5):
        engine.log_entry(
            user_id=user_id,
            mood="sad" if i % 2 == 0 else "stressed",
            activities=["work"],
            energy_level=3
        )
    
    initial_recs = engine.get_recommendations(user_id, current_mood="stressed")
    print(f"  Initial recommendations count: {len(initial_recs)}")
    
    print("\nPhase 2: User discovers exercise helps...")
    for i in range(10):
        engine.log_entry(
            user_id=user_id,
            mood="happy",
            activities=["exercise", "meditation"],
            energy_level=8
        )
    
    improved_recs = engine.get_recommendations(user_id)
    print(f"  Updated recommendations count: {len(improved_recs)}")
    
    print("\nThe AI has learned! Top recommendation now:")
    if improved_recs:
        print(f"  {improved_recs[0].content}")
    
    # Show learned correlations
    profile = engine.get_user_profile(user_id)
    correlations = engine.learning_engine.find_activity_mood_correlations(profile)
    
    print("\nActivity-Mood Correlations:")
    for activity, score in sorted(correlations.items(), key=lambda x: x[1], reverse=True):
        sentiment = "positive" if score > 0 else "negative"
        print(f"  {activity}: {score:.2f} ({sentiment})")


def demo_daily_summary():
    """Demonstrate daily summary feature."""
    print_section("DEMO 5: Daily Summary")
    
    engine = PersonalizationEngine(data_dir="/tmp/demo_data")
    user_id = "demo_user"
    
    summary = engine.get_summary(user_id)
    
    print(f"📊 Your Daily Summary")
    print(f"\nTotal Entries: {summary['total_entries']}")
    print(f"Recent Streak: {summary['streak_days']} days")
    print(f"Mood Trend: {summary['recent_mood_trend']}")
    
    metrics = summary['metrics']
    print(f"\n📈 Your Metrics:")
    print(f"  Consistency Score: {metrics['consistency_score']}/100")
    print(f"  Well-being Score: {metrics['well_being_score']}/100")
    print(f"  Activity Diversity: {metrics['activity_diversity']} unique activities")
    
    if summary['insights']:
        print(f"\n💡 Insights:")
        for insight in summary['insights']:
            print(f"  • {insight}")


def main():
    """Run all demos."""
    print("\n" + "=" * 70)
    print("  AI-POWERED PERSONALIZATION ENGINE - DEMO")
    print("=" * 70)
    
    try:
        demo_basic_usage()
        demo_recommendations()
        demo_insights()
        demo_adaptive_learning()
        demo_daily_summary()
        
        print("\n" + "=" * 70)
        print("  Demo completed successfully! ✓")
        print("=" * 70 + "\n")
        
    except Exception as e:
        print(f"\nError during demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
