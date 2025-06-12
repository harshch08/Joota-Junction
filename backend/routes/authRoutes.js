const express = require('express');
const router = express.Router();
const { generateOtp, verifyOtpAndRegister } = require('../controllers/authController');

// Generate and send OTP
router.post('/generate-otp', generateOtp);

// Verify OTP and register user
router.post('/verify-otp', verifyOtpAndRegister);

module.exports = router; 