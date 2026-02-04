const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['investment_banker', 'startup'],
    required: true
  },
  // For Investment Bankers
  sebiRegistrationNumber: {
    type: String,
    sparse: true, // Allows null values but ensures uniqueness when present
    trim: true
  },
  sebiVerified: {
    type: Boolean,
    default: false
  },
  // For Startups
  startupUniqueId: {
    type: String,
    sparse: true, // Allows null values but ensures uniqueness when present
    trim: true
  },
  startupVerified: {
    type: Boolean,
    default: false
  },
  // Common fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Validation: Ensure SEBI ID is present for investment bankers
userSchema.pre('validate', function(next) {
  if (this.userType === 'investment_banker' && !this.sebiRegistrationNumber) {
    this.invalidate('sebiRegistrationNumber', 'SEBI Registration Number is required for investment bankers');
  }
  if (this.userType === 'startup' && !this.startupUniqueId) {
    this.invalidate('startupUniqueId', 'Startup Unique ID is required for startups');
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
