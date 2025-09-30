const express = require('express');
const Joi = require('joi');
const FileDataManager = require('../models/FileDataManager');
const auth = require('../middleware/auth');

// Import AI modules
const { analyzeSentiment } = require('../ai/sentimentAnalyzer');
const { generateRecommendations } = require('../ai/recommendationEngine');

const router = express.Router();

// Simplified validation schema for file-based system
const dailyLogSchema = Joi.object({
  date: Joi.string().optional(),
  mood: Joi.number().min(1).max(10).required(),
  energy: Joi.number().min(1).max(10).required(),
  stress: Joi.number().min(1).max(10).required(),
  sleep: Joi.number().min(1).max(10).required(),
  notes: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Create daily log
router.post('/', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = dailyLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    // Create new log
    const newLog = FileDataManager.createLog(req.user._id, value);

    // Analyze sentiment if notes are provided
    let sentimentAnalysis = null;
    if (newLog.notes) {
      try {
        sentimentAnalysis = analyzeSentiment(newLog.notes);
      } catch (error) {
        console.error('Sentiment analysis error:', error);
      }
    }

    res.status(201).json({
      message: 'Daily log created successfully',
      log: newLog,
      sentimentAnalysis
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Server error creating log' });
  }
});

// Get user's daily logs
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const logs = FileDataManager.getUserLogs(req.user._id, limit);

    res.json({
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
});

// Get specific log by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const logs = FileDataManager.getUserLogs(req.user._id);
    const log = logs.find(log => log.id === req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ log });
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ message: 'Server error fetching log' });
  }
});

// Update daily log
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = dailyLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const updatedLog = FileDataManager.updateLog(req.params.id, req.user._id, value);

    res.json({
      message: 'Log updated successfully',
      log: updatedLog
    });
  } catch (error) {
    console.error('Update log error:', error);
    if (error.message === 'Log not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating log' });
  }
});

// Delete daily log
router.delete('/:id', auth, async (req, res) => {
  try {
    FileDataManager.deleteLog(req.params.id, req.user._id);
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    if (error.message === 'Log not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error deleting log' });
  }
});

// Get analytics
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const analytics = FileDataManager.getUserAnalytics(req.user._id);
    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Get mood recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recentLogs = FileDataManager.getUserLogs(req.user._id, 7);
    
    if (recentLogs.length === 0) {
      return res.json({
        recommendations: [
          "Start tracking your mood daily to get personalized recommendations",
          "Try meditation for 10 minutes today",
          "Get some fresh air and sunlight"
        ]
      });
    }

    const recommendations = generateRecommendations(recentLogs);
    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
});

module.exports = router;

// Create or update daily log
router.post('/', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = dailyLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { date, mood, habits, activities, notes } = value;
    const logDate = date ? new Date(date) : new Date();
    
    // Set date to start of day for consistency
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists for this date
    let dailyLog = await DailyLog.findOne({
      userId: req.user._id,
      date: {
        $gte: logDate,
        $lt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (dailyLog) {
      // Update existing log
      dailyLog.mood = mood;
      dailyLog.habits = habits || dailyLog.habits;
      dailyLog.activities = activities || dailyLog.activities;
      if (notes) {
        dailyLog.notes = { encrypted: notes };
      }
      await dailyLog.save();
    } else {
      // Create new log
      dailyLog = new DailyLog({
        userId: req.user._id,
        date: logDate,
        mood,
        habits: habits || [],
        activities: activities || [],
        notes: notes ? { encrypted: notes } : undefined
      });
      await dailyLog.save();
    }

    res.status(201).json({
      message: 'Daily log saved successfully',
      log: {
        id: dailyLog._id,
        date: dailyLog.date,
        mood: dailyLog.mood,
        habits: dailyLog.habits,
        activities: dailyLog.activities,
        hasNotes: !!dailyLog.notes?.encrypted
      }
    });
  } catch (error) {
    console.error('Daily log creation error:', error);
    res.status(500).json({ message: 'Server error creating daily log' });
  }
});

// Get daily logs for a user (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Date range filtering
    let dateFilter = { userId: req.user._id };
    if (req.query.startDate || req.query.endDate) {
      dateFilter.date = {};
      if (req.query.startDate) {
        dateFilter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        dateFilter.date.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await DailyLog.find(dateFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select('-notes'); // Don't return encrypted notes in list view

    const total = await DailyLog.countDocuments(dateFilter);

    res.json({
      logs: logs.map(log => ({
        id: log._id,
        date: log.date,
        mood: log.mood,
        habits: log.habits,
        activities: log.activities,
        hasNotes: !!log.notes?.encrypted,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Daily logs fetch error:', error);
    res.status(500).json({ message: 'Server error fetching daily logs' });
  }
});

// Get specific daily log by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await DailyLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    // Decrypt notes if they exist
    const decryptedNotes = log.getDecryptedNotes();

    res.json({
      log: {
        id: log._id,
        date: log.date,
        mood: log.mood,
        habits: log.habits,
        activities: log.activities,
        notes: decryptedNotes,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      }
    });
  } catch (error) {
    console.error('Daily log fetch error:', error);
    res.status(500).json({ message: 'Server error fetching daily log' });
  }
});

// Update specific daily log
router.put('/:id', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = dailyLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const log = await DailyLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    const { mood, habits, activities, notes } = value;

    // Update fields
    if (mood) log.mood = mood;
    if (habits) log.habits = habits;
    if (activities) log.activities = activities;
    if (notes) log.notes = { encrypted: notes };

    await log.save();

    res.json({
      message: 'Daily log updated successfully',
      log: {
        id: log._id,
        date: log.date,
        mood: log.mood,
        habits: log.habits,
        activities: log.activities,
        hasNotes: !!log.notes?.encrypted
      }
    });
  } catch (error) {
    console.error('Daily log update error:', error);
    res.status(500).json({ message: 'Server error updating daily log' });
  }
});

// Delete daily log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await DailyLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    res.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    console.error('Daily log deletion error:', error);
    res.status(500).json({ message: 'Server error deleting daily log' });
  }
});

// Get mood analytics
router.get('/analytics/mood', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const moodData = logs.map(log => ({
      date: log.date,
      score: log.mood.score,
      description: log.mood.description
    }));

    const averageMood = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.mood.score, 0) / logs.length 
      : 0;

    res.json({
      analytics: {
        averageMood: parseFloat(averageMood.toFixed(2)),
        totalEntries: logs.length,
        dateRange: {
          start: startDate,
          end: new Date()
        },
        moodTrend: moodData
      }
    });
  } catch (error) {
    console.error('Mood analytics error:', error);
    res.status(500).json({ message: 'Server error generating mood analytics' });
  }
});

module.exports = router;