import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from './OTPInput';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLogin?: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onShowLogin 
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { sendOTP, verifyOTP, resendOTP, error: authError } = useAuth();

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await sendOTP(email, name);
      setStep('otp');
      setCountdown(30); // 30 seconds countdown
      setCanResend(false);
      setSuccessMessage('Verification code sent to your email!');
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await verifyOTP(email, otp, name, password);
      setSuccessMessage('Account created successfully! Welcome to JOOTA JUNCTION!');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error verifying OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await resendOTP(email, name);
      setCountdown(30);
      setCanResend(false);
      setSuccessMessage('New verification code sent!');
    } catch (error) {
      console.error('Error resending OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setErrorMessage('');
    setSuccessMessage('');
    setCountdown(0);
    setCanResend(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleShowLogin = () => {
    handleClose();
    if (onShowLogin) {
      onShowLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold animate-gradient-text">
              JOOTA JUNCTION
            </h1>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'email' ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 'email' 
              ? 'Join our community of fashion enthusiasts' 
              : 'Enter the verification code sent to your email'
            }
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center animate-fadeIn">
            <CheckCircle className="h-4 w-4 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {(errorMessage || authError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center animate-fadeIn">
            <AlertCircle className="h-4 w-4 mr-2" />
            {errorMessage || authError}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                minLength={2}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                minLength={6}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit verification code to:
              </p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Enter Verification Code
              </label>
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                autoFocus={true}
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <div className="text-center space-y-4">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : (
                    `Resend in ${countdown}s`
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center mx-auto transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Registration
              </button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={handleShowLogin}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal; 