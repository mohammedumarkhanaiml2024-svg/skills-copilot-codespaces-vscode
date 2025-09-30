const express = require('express');
const Joi = require('joi');
const FileDataManager = require('../models/FileDataManager');
const auth = require('../middleware/auth');
const { analyzeSentiment } = require('../ai/sentimentAnalyzer');
const { generateRecommendations } = require('../ai/recommendationEngine');

const router = express.Router();

// Enhanced AI response generator
const generateAIResponse = async (userMessage, userId) => {
  try {
    // Analyze sentiment of user message
    const sentimentResult = analyzeSentiment(userMessage);
    
    // Get recent logs for context
    const recentLogs = FileDataManager.getUserLogs(userId, 7); 
      context.currentMood, 
      recentLogs
    );
    
    // Get mood prediction for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const moodPrediction = await moodPredictor.predictMood(userId, tomorrow);
    
    // Generate contextual response
    let response = generateContextualResponse(userMessage, sentimentResult, context, recommendations);
    
    // Add personalized insights
    if (recommendations.analysis && recommendations.analysis.insights && recommendations.analysis.insights.length > 0) {
      response += `\n\n💡 Insight: ${recommendations.analysis.insights[0].message}`;
    }
    
    // Add prediction if confident enough
    if (moodPrediction.confidence > 0.6 && moodPrediction.predictedMood) {
      response += `\n\n🔮 Tomorrow's mood prediction: ${moodPrediction.predictedMood}/10 (${Math.round(moodPrediction.confidence * 100)}% confidence)`;
    }
    
    // Get dynamic suggestions based on sentiment and recommendations
    const suggestions = getSuggestionsFromAnalysis(sentimentResult, recommendations);
    
    return {
      content: response,
      suggestedActions: suggestions,
      confidence: Math.min(sentimentResult.confidence + recommendations.confidence, 1.0),
      sentiment: sentimentResult,
      recommendations: recommendations.recommendations,
      prediction: moodPrediction.predictedMood ? {
        mood: moodPrediction.predictedMood,
        confidence: moodPrediction.confidence
      } : null
    };
  } catch (error) {
    console.error('Enhanced AI response error:', error);
    // Fallback to simple response
    return generateSimpleResponse(userMessage, context);
  }
};

const generateContextualResponse = (userMessage, sentimentResult, context, recommendations) => {
  const { currentMood } = context;
  const { moodCategory, moodKeywords } = sentimentResult;
  
  let response = "";
  
  // Sentiment-based opening
  if (moodCategory === 'negative' || (currentMood && currentMood.score <= 4)) {
    response = "I can sense that things might feel challenging right now, and that's completely valid. ";
    
    if (moodKeywords.negative.length > 0) {
      response += `You mentioned feeling ${moodKeywords.negative.join(' and ')}, which takes courage to share. `;
    }
    
    // Add personalized encouragement based on past successes
    if (recommendations.analysis.habitSuccess.length > 0) {
      const bestHabit = recommendations.analysis.habitSuccess[0];
      response += `Remember, you've been successful with ${bestHabit.name} - that shows your strength. `;
    }
    
  } else if (moodCategory === 'positive' || (currentMood && currentMood.score >= 7)) {
    response = "I love the positive energy in your message! ";
    
    if (moodKeywords.positive.length > 0) {
      response += `It's wonderful that you're feeling ${moodKeywords.positive.join(' and ')}. `;
    }
    
    response += "These good moments are worth celebrating and building upon. ";
    
  } else {
    response = "Thanks for sharing what's on your mind. ";
    
    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('advice')) {
      response += "I'm here to help you navigate whatever you're experiencing. ";
    }
  }
  
  // Add habit-specific feedback
  if (context.recentHabits && context.recentHabits.length > 0) {
    const habitCount = context.recentHabits.length;
    response += `I see you've been working on ${habitCount} different habit${habitCount > 1 ? 's' : ''} recently. `;
    
    if (recommendations.analysis && recommendations.analysis.streaks && recommendations.analysis.streaks.current > 3) {
      response += `Your ${recommendations.analysis.streaks.current}-day logging streak shows real commitment! `;
    }
  }
  
  // Add specific recommendations
  if (recommendations.recommendations && recommendations.recommendations.habits && recommendations.recommendations.habits.length > 0) {
    const habitRec = recommendations.recommendations.habits[0];
    if (habitRec.type === 'boost' && moodCategory === 'negative') {
      response += `Based on your patterns, ${habitRec.habits.join(' or ')} often help improve your mood. `;
    }
  }
  
  // Engaging question based on context
  if (moodCategory === 'negative') {
    response += "What feels most manageable for you right now?";
  } else if (moodCategory === 'positive') {
    response += "How would you like to make the most of this positive energy?";
  } else {
    response += "What's one thing that would make today feel more fulfilling?";
  }
  
  return response;
};

const getSuggestionsFromAnalysis = (sentimentResult, recommendations) => {
  const suggestions = [];
  
  // Sentiment-based suggestions
  const sentimentSuggestions = sentimentAnalyzer.getMoodSuggestions(sentimentResult);
  suggestions.push(...sentimentSuggestions.immediate.slice(0, 2));
  
  // Recommendation-based suggestions
  if (recommendations.recommendations && recommendations.recommendations.habits && recommendations.recommendations.habits.length > 0) {
    const habitRec = recommendations.recommendations.habits[0];
    if (habitRec.type === 'boost') {
      suggestions.push(`Try: ${habitRec.habits[0]}`);
    }
  }
  
  if (recommendations.recommendations && recommendations.recommendations.activities && recommendations.recommendations.activities.length > 0) {
    const activityRec = recommendations.recommendations.activities[0];
    suggestions.push(`Consider: ${activityRec.activities[0]} activity`);
  }
  
  // Add personalized suggestion based on past success
  if (recommendations.analysis && recommendations.analysis.activityCorrelations && recommendations.analysis.activityCorrelations.length > 0) {
    const bestActivity = recommendations.analysis.activityCorrelations
      .sort((a, b) => b.avgMoodAfter - a.avgMoodAfter)[0];
    
    if (bestActivity.avgMoodAfter > 6) {
      suggestions.push(`${bestActivity.type} usually boosts your mood`);
    }
  }
  
  return suggestions.slice(0, 4); // Limit to 4 suggestions
};

const generateSimpleResponse = (userMessage, context) => {
  // Fallback simple response (original logic)
  const { currentMood, recentHabits, recentActivities } = context;
  
  let response = "";
  let suggestedActions = [];
  
  if (currentMood && currentMood.score <= 3) {
    response = "I notice you're feeling down today. That's completely okay - everyone has difficult days. ";
    if (recentActivities.includes('exercise')) {
      response += "I see you've been active, which is great for your mood. ";
    }
    response += "Would you like to talk about what's making you feel this way?";
    suggestedActions = ['Take a short walk', 'Practice deep breathing', 'Listen to calming music'];
  } else if (currentMood && currentMood.score >= 8) {
    response = "You seem to be in a great mood today! That's wonderful to see. ";
    response += "What's been going well for you lately?";
    suggestedActions = ['Share your joy with someone', 'Try something new', 'Reflect on what made today special'];
  } else {
    response = "How are you feeling today? I'm here to listen and help you with whatever is on your mind.";
    suggestedActions = ['Share your thoughts', 'Review your recent habits', 'Set a small goal for today'];
  }
  
  if (recentHabits.length > 0) {
    response += ` I noticed you've been working on: ${recentHabits.join(', ')}. Keep up the great work!`;
  }
  
  return {
    content: response,
    suggestedActions,
    confidence: 0.7
  };
};

// Validation schemas
const messageSchema = Joi.object({
  message: Joi.string().required(),
  sessionId: Joi.string().optional()
});

// Start or continue chat session
router.post('/message', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { message, sessionId } = value;
    const currentSessionId = sessionId || crypto.randomUUID();

    // Get user's recent context for AI
    const recentLogs = await DailyLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7); // Last 7 days

    let currentMood = null;
    let recentHabits = [];
    let recentActivities = [];

    if (recentLogs.length > 0) {
      currentMood = recentLogs[0].mood;
      recentHabits = [...new Set(recentLogs.flatMap(log => 
        log.habits.map(habit => habit.name)
      ))];
      recentActivities = [...new Set(recentLogs.flatMap(log => 
        log.activities.map(activity => activity.type)
      ))];
    }

    const context = {
      currentMood,
      recentHabits,
      recentActivities
    };

    // Find or create chat session
    let chatSession = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: currentSessionId,
      isActive: true
    });

    if (!chatSession) {
      chatSession = new ChatHistory({
        userId: req.user._id,
        sessionId: currentSessionId,
        context,
        aiPersonality: req.user.preferences?.aiPersonality || 'supportive',
        messages: []
      });
    } else {
      // Update context with latest data
      chatSession.context = context;
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(message, context, req.user._id);
    
    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        moodContext: currentMood,
        suggestedActions: aiResponse.suggestedActions,
        confidence: aiResponse.confidence
      }
    });

    await chatSession.save();

    res.json({
      sessionId: currentSessionId,
      response: {
        content: aiResponse.content,
        suggestedActions: aiResponse.suggestedActions,
        timestamp: new Date()
      },
      context: {
        currentMood: currentMood,
        hasRecentData: recentLogs.length > 0
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ message: 'Server error processing chat message' });
  }
});

// Get chat history for a session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const chatSession = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: req.params.sessionId
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({
      sessionId: chatSession.sessionId,
      messages: chatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        suggestedActions: msg.metadata?.suggestedActions
      })),
      context: chatSession.context,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt
    });

  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
});

// Get all chat sessions for user
router.get('/sessions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sessions = await ChatHistory.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('sessionId messages.0 messages.-1 createdAt updatedAt isActive');

    const total = await ChatHistory.countDocuments({ userId: req.user._id });

    const sessionList = sessions.map(session => ({
      sessionId: session.sessionId,
      firstMessage: session.messages[0]?.content || '',
      lastMessage: session.messages[session.messages.length - 1]?.content || '',
      messageCount: session.messages.length,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));

    res.json({
      sessions: sessionList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Chat sessions fetch error:', error);
    res.status(500).json({ message: 'Server error fetching chat sessions' });
  }
});

// End/deactivate chat session
router.put('/session/:sessionId/end', auth, async (req, res) => {
  try {
    const chatSession = await ChatHistory.findOneAndUpdate(
      {
        userId: req.user._id,
        sessionId: req.params.sessionId
      },
      { isActive: false },
      { new: true }
    );

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({
      message: 'Chat session ended successfully',
      sessionId: chatSession.sessionId
    });

  } catch (error) {
    console.error('Chat session end error:', error);
    res.status(500).json({ message: 'Server error ending chat session' });
  }
});

// Delete chat session
router.delete('/session/:sessionId', auth, async (req, res) => {
  try {
    const chatSession = await ChatHistory.findOneAndDelete({
      userId: req.user._id,
      sessionId: req.params.sessionId
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });

  } catch (error) {
    console.error('Chat session deletion error:', error);
    res.status(500).json({ message: 'Server error deleting chat session' });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recentLogs = await DailyLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    if (recentLogs.length === 0) {
      return res.json({
        message: 'Need at least one daily log to generate recommendations',
        recommendations: null
      });
    }

    const currentMood = recentLogs[0]?.mood;
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
      req.user._id,
      currentMood,
      recentLogs
    );

    res.json({
      recommendations: recommendations.recommendations,
      analysis: recommendations.analysis,
      confidence: recommendations.confidence,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
});

// Get mood prediction
router.get('/predict-mood', auth, async (req, res) => {
  try {
    const targetDate = req.query.date || new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const prediction = await moodPredictor.predictMood(req.user._id, targetDate);

    res.json({
      prediction,
      targetDate,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Mood prediction error:', error);
    res.status(500).json({ message: 'Server error generating mood prediction' });
  }
});

// Get mood trends analysis
router.get('/mood-trends', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await moodPredictor.getMoodTrends(req.user._id, days);

    res.json({
      trends,
      period: `${days} days`,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Mood trends error:', error);
    res.status(500).json({ message: 'Server error analyzing mood trends' });
  }
});

// Analyze sentiment of text
router.post('/analyze-sentiment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required for sentiment analysis' });
    }

    const sentimentResult = sentimentAnalyzer.analyzeSentiment(text);
    const suggestions = sentimentAnalyzer.getMoodSuggestions(sentimentResult);

    res.json({
      sentiment: sentimentResult,
      suggestions,
      analyzedAt: new Date()
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ message: 'Server error analyzing sentiment' });
  }
});

module.exports = router;