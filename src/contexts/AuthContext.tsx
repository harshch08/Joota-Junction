import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, emailVerificationAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  cart: any[];
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  sendOTP: (email: string, name?: string) => Promise<void>;
  verifyOTP: (email: string, otp: string, name: string, password: string) => Promise<void>;
  resendOTP: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  clearAllAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authAPI.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { token, user: userData } = await authAPI.login({ email, password });
      
      // Check if user is admin
      if (userData.role === 'admin') {
        // Store admin token and user data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        // Also store regular token for compatibility
        localStorage.setItem('token', token);
        setUser(userData);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // Regular user login
        localStorage.setItem('token', token);
        setUser(userData);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const { token, user: userData } = await authAPI.register({ name, email, password });
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const sendOTP = async (email: string, name?: string) => {
    try {
      setError(null);
      await emailVerificationAPI.sendOTP({ email, name });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send verification code');
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string, name: string, password: string) => {
    try {
      setError(null);
      const { token, user: userData } = await emailVerificationAPI.verifyOTP({ 
        email, 
        otp, 
        name, 
        password 
      });
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Verification failed');
      throw error;
    }
  };

  const resendOTP = async (email: string, name?: string) => {
    try {
      setError(null);
      await emailVerificationAPI.resendOTP({ email, name });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend verification code');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const clearAllAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        sendOTP,
        verifyOTP,
        resendOTP,
        logout,
        clearAllAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
