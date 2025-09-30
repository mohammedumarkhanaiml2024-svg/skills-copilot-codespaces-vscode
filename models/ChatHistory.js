const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      moodContext: {
        score: Number,
        description: String
      },
      suggestedActions: [String],
      confidence: Number
    }
  }],
  context: {
    currentMood: {
      score: Number,
      description: String
    },
    recentHabits: [String],
    recentActivities: [String]
  },
  aiPersonality: {
    type: String,
    enum: ['supportive', 'motivational', 'analytical', 'friendly'],
    default: 'supportive'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient user-session queries
chatHistorySchema.index({ userId: 1, sessionId: 1 });
chatHistorySchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt field before saving
chatHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a new message to the chat
chatHistorySchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Method to get recent messages (last N messages)
chatHistorySchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);