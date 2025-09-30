const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    dateOfBirth: Date,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  preferences: {
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    aiPersonality: {
      type: String,
      enum: ['supportive', 'motivational', 'analytical', 'friendly'],
      default: 'supportive'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    this.passwordHash = await argon2.hash(this.passwordHash);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await argon2.verify(this.passwordHash, candidatePassword);
  } catch (error) {
    return false;
  }
};

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);