const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const EmailVerification = require('../models/EmailVerification');
const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

// Rate limiting for OTP requests (5 requests per 15 minutes per IP)
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many OTP requests. Please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) // retry after 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for OTP verification (10 attempts per 15 minutes per IP)
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    message: 'Too many verification attempts. Please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) // retry after 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Send OTP for email verification
router.post('/send-otp', otpRequestLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await EmailVerification.deleteMany({ email: email.toLowerCase() });

    // Create new OTP record
    const emailVerification = new EmailVerification({
      email: email.toLowerCase(),
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await emailVerification.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name || 'User');

    if (!emailResult.success) {
      // If email sending fails, delete the OTP record
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    console.log(`OTP sent to ${email}: ${otp}`);
    
    res.json({ 
      message: 'Verification code sent to your email',
      email: email.toLowerCase() // Return masked email for security
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Error sending verification code. Please try again.' 
    });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', otpVerificationLimiter, async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    // Validate input
    if (!email || !otp || !name || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find the OTP record
    const emailVerification = await EmailVerification.findOne({ 
      email: email.toLowerCase() 
    });

    if (!emailVerification) {
      return res.status(400).json({ 
        message: 'No verification code found. Please request a new one.' 
      });
    }

    // Check if OTP is expired
    if (emailVerification.isExpired()) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(400).json({ 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Check if max attempts exceeded
    if (emailVerification.isMaxAttemptsExceeded()) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please request a new verification code.' 
      });
    }

    // Verify OTP
    if (emailVerification.otp !== otp) {
      await emailVerification.incrementAttempts();
      return res.status(400).json({ 
        message: 'Invalid verification code. Please try again.' 
      });
    }

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      emailVerified: true // Add this field to User model
    });

    // Delete the OTP record
    await EmailVerification.deleteOne({ _id: emailVerification._id });

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(email, name).catch(error => {
      console.error('Error sending welcome email:', error);
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User registered successfully:', user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        cart: user.cart
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating account. Please try again.' 
    });
  }
});

// Resend OTP (with rate limiting)
router.post('/resend-otp', otpRequestLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await EmailVerification.deleteMany({ email: email.toLowerCase() });

    // Create new OTP record
    const emailVerification = new EmailVerification({
      email: email.toLowerCase(),
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await emailVerification.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name || 'User');

    if (!emailResult.success) {
      // If email sending fails, delete the OTP record
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    console.log(`OTP resent to ${email}: ${otp}`);
    
    res.json({ 
      message: 'New verification code sent to your email',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ 
      message: 'Error sending verification code. Please try again.' 
    });
  }
});

module.exports = router; 