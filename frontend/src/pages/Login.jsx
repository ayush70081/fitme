// pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock,
  Shield,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import OTPVerification from '../components/OTPVerification';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Clear errors when component mounts or when user starts fresh
  useEffect(() => {
    if (location.state?.clearErrors) {
      setErrors({});
      setLastError(null);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear general error when user makes changes
    if (errors.submit && (name === 'email' || name === 'password')) {
      setErrors(prev => ({
        ...prev,
        submit: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = {
        message: 'Email address is required',
        type: 'required'
      };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = {
        message: 'Please enter a valid email address',
        type: 'format',
        suggestions: ['Make sure your email includes @ and a domain (e.g., user@example.com)']
      };
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = {
        message: 'Password is required',
        type: 'required'
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorIcon = (errorCode) => {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      case 'INVALID_PASSWORD':
        return <Shield className="w-5 h-5 text-orange-500" />;
      case 'ACCOUNT_LOCKED':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'EMAIL_NOT_VERIFIED':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'SERVER_ERROR':
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorColor = (errorCode) => {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return 'blue';
      case 'INVALID_PASSWORD':
        return 'orange';
      case 'ACCOUNT_LOCKED':
        return 'red';
      case 'EMAIL_NOT_VERIFIED':
        return 'yellow';
      case 'SERVER_ERROR':
        return 'gray';
      default:
        return 'red';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setLastError(null);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Success - navigate to appropriate page
        if (result.onboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        // Handle specific error from login
        handleLoginError(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: {
          message: 'An unexpected error occurred. Please try again.',
          errorCode: 'UNEXPECTED_ERROR',
          suggestions: ['Check your internet connection', 'Try again in a moment']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (errorResult) => {
    const errorInfo = typeof errorResult === 'string' ? 
      { message: errorResult, errorCode: 'GENERIC_ERROR' } : 
      errorResult;

    // Handle email not verified error
    if (errorInfo.errorCode === 'EMAIL_NOT_VERIFIED') {
      setUnverifiedEmail(errorInfo.data?.email || formData.email);
      setShowOTPVerification(true);
      return;
    }

    setLastError(errorInfo);
    setRetryCount(prev => prev + 1);
    
    // Set appropriate error state
    setErrors({ 
      submit: {
        message: errorInfo.message,
        errorCode: errorInfo.errorCode,
        suggestions: errorInfo.suggestions || [],
        attemptsRemaining: errorInfo.attemptsRemaining,
        timeRemaining: errorInfo.timeRemaining,
        missingFields: errorInfo.missingFields
      }
    });
  };

  const handleOTPSuccess = (data) => {
    // OTP verification successful, redirect to appropriate page
    if (data.user?.profileCompleted) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  };

  const handleBackToLogin = () => {
    setShowOTPVerification(false);
    setUnverifiedEmail('');
  };

  const renderErrorMessage = (error) => {
    if (!error) return null;

    const colorClass = getErrorColor(error.errorCode);
    const bgColor = `bg-${colorClass}-50`;
    const borderColor = `border-${colorClass}-200`;
    const textColor = `text-${colorClass}-800`;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}
      >
        <div className="flex items-start space-x-3">
          {getErrorIcon(error.errorCode)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {error.message}
            </p>
            
            {/* Additional Info */}
            {error.attemptsRemaining !== undefined && (
              <p className={`text-sm mt-1 ${textColor}`}>
                <strong>{error.attemptsRemaining}</strong> attempts remaining
              </p>
            )}
            
            {error.timeRemaining && (
              <p className={`text-sm mt-1 ${textColor}`}>
                Try again in <strong>{error.timeRemaining} minutes</strong>
              </p>
            )}

            {/* Suggestions */}
            {error.suggestions && error.suggestions.length > 0 && (
              <div className="mt-3">
                <p className={`text-sm font-medium ${textColor} mb-2`}>
                  What you can do:
                </p>
                <ul className={`text-sm ${textColor} space-y-1`}>
                  {error.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            {error.errorCode === 'EMAIL_NOT_FOUND' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}

            {(error.errorCode === 'INVALID_PASSWORD' || error.errorCode === 'ACCOUNT_LOCKED') && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors"
                >
                  Reset Password
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFieldError = (fieldError) => {
    if (!fieldError) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1"
      >
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {fieldError.message}
        </p>
        {fieldError.suggestions && (
          <ul className="text-xs text-red-500 mt-1 ml-5 space-y-1">
            {fieldError.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        )}
      </motion.div>
    );
  };

  // Show OTP verification if user needs email verification
  if (showOTPVerification) {
    return (
      <OTPVerification 
        email={unverifiedEmail}
        onSuccess={handleOTPSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="w-full max-w-md">
        {/* Back to home button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              FitMe+
            </motion.div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your fitness journey</p>
          </div>

          {/* Success Message from Registration */}
          {location.state?.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-green-800">{location.state.message}</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {errors.submit && renderErrorMessage(errors.submit)}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </div>
              {renderFieldError(errors.email)}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {renderFieldError(errors.password)}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-5 w-5 border-b-2 border-white mr-2"
                  />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-6">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-900 hover:opacity-80 transition-colors duration-200 inline-flex items-center"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Forgot your password?
            </Link>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-gray-900 hover:opacity-80 font-medium transition-colors duration-200"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Having trouble? Check our{' '}
            <Link to="/help" className="text-gray-900 hover:opacity-80">
              help center
            </Link>{' '}
            or{' '}
            <Link to="/contact" className="text-gray-900 hover:opacity-80">
              contact support
            </Link>
          </p>
        </motion.div>

        {/* Removed development mode notice */}
      </div>
    </div>
  );
};

export default Login; 