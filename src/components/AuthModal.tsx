import React, { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmailVerificationModal from './EmailVerificationModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { login, error: authError } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setIsAdminLogin(false);
    
    try {
      console.log('Login attempt:', { email });
      await login(email, password);
      
      // Check if this was an admin login
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        const userData = JSON.parse(adminUser);
        if (userData.role === 'admin') {
          setIsAdminLogin(true);
          // Keep modal open briefly to show success message
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1500);
          return;
        }
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setIsAdminLogin(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleShowLogin = () => {
    setShowEmailVerification(false);
    // The login modal is already open, so we just need to close the email verification modal
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {isAdminLogin && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              Admin login successful! Redirecting to admin dashboard...
            </div>
          )}

          {(errorMessage || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMessage || authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isAdminLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : isAdminLogin ? 'Redirecting...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowEmailVerification(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Don't have an account? Create one
            </button>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onShowLogin={handleShowLogin}
      />
    </>
  );
};

export default AuthModal;
