const mongoose = require('mongoose');
const crypto = require('crypto');

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mood: {
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    description: {
      type: String,
      enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
      required: true
    },
    notes: String
  },
  habits: [{
    name: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['exercise', 'meditation', 'work', 'social', 'hobby', 'rest', 'other'],
      required: true
    },
    name: String,
    duration: Number, // in minutes
    enjoyment: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  notes: {
    encrypted: String, // AES-256 encrypted personal notes
    iv: String // Initialization vector for decryption
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

// Create compound index for efficient user-date queries
dailyLogSchema.index({ userId: 1, date: -1 });

// Encrypt notes before saving
dailyLogSchema.pre('save', function(next) {
  if (this.notes && this.notes.encrypted && !this.notes.iv) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher(algorithm, key);
      let encrypted = cipher.update(this.notes.encrypted, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      this.notes.encrypted = encrypted;
      this.notes.iv = iv.toString('hex');
    } catch (error) {
      return next(error);
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to decrypt notes
dailyLogSchema.methods.getDecryptedNotes = function() {
  if (!this.notes || !this.notes.encrypted || !this.notes.iv) {
    return null;
  }
  
  try {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    const iv = Buffer.from(this.notes.iv, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(this.notes.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = mongoose.model('DailyLog', dailyLogSchema);