const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic cleanup of expired OTPs
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is expired
emailVerificationSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to increment attempts
emailVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to check if max attempts exceeded
emailVerificationSchema.methods.isMaxAttemptsExceeded = function() {
  return this.attempts >= 5;
};

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

module.exports = EmailVerification; 