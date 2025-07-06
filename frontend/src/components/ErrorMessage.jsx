import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  HelpCircle, 
  Shield, 
  Clock, 
  Info, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  showQuickActions = true, 
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  if (!error) return null;

  const getErrorIcon = (errorCode) => {
    const iconSize = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5';
    
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return <HelpCircle className={`${iconSize} text-blue-500`} />;
      case 'INVALID_PASSWORD':
        return <Shield className={`${iconSize} text-orange-500`} />;
      case 'ACCOUNT_LOCKED':
        return <Clock className={`${iconSize} text-red-500`} />;
      case 'EMAIL_NOT_VERIFIED':
        return <Info className={`${iconSize} text-yellow-500`} />;
      case 'SERVER_ERROR':
        return <RefreshCw className={`${iconSize} text-gray-500`} />;
      case 'VALIDATION_ERROR':
        return <AlertTriangle className={`${iconSize} text-orange-500`} />;
      case 'UNAUTHORIZED':
        return <Shield className={`${iconSize} text-red-500`} />;
      case 'FORBIDDEN':
        return <XCircle className={`${iconSize} text-red-500`} />;
      case 'NOT_FOUND':
        return <HelpCircle className={`${iconSize} text-gray-500`} />;
      case 'RATE_LIMITED':
        return <Clock className={`${iconSize} text-yellow-500`} />;
      default:
        return <AlertCircle className={`${iconSize} text-red-500`} />;
    }
  };

  const getErrorColor = (errorCode) => {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return 'blue';
      case 'INVALID_PASSWORD':
      case 'VALIDATION_ERROR':
        return 'orange';
      case 'ACCOUNT_LOCKED':
      case 'UNAUTHORIZED':
      case 'FORBIDDEN':
        return 'red';
      case 'EMAIL_NOT_VERIFIED':
      case 'RATE_LIMITED':
        return 'yellow';
      case 'SERVER_ERROR':
      case 'NOT_FOUND':
        return 'gray';
      default:
        return 'red';
    }
  };

  const getQuickActions = (errorCode) => {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return [
          { label: 'Create Account', to: '/register', color: 'blue' },
          { label: 'Contact Support', to: '/contact', color: 'gray' }
        ];
      case 'INVALID_PASSWORD':
      case 'ACCOUNT_LOCKED':
        return [
          { label: 'Reset Password', to: '/forgot-password', color: 'orange' },
          { label: 'Contact Support', to: '/contact', color: 'gray' }
        ];
      case 'EMAIL_NOT_VERIFIED':
        return [
          { label: 'Resend Email', action: 'resendVerification', color: 'yellow' },
          { label: 'Contact Support', to: '/contact', color: 'gray' }
        ];
      case 'SERVER_ERROR':
        return [
          { label: 'Try Again', action: 'retry', color: 'gray' },
          { label: 'Report Issue', to: '/report', color: 'gray' }
        ];
      case 'UNAUTHORIZED':
        return [
          { label: 'Login', to: '/login', color: 'blue' },
          { label: 'Contact Support', to: '/contact', color: 'gray' }
        ];
      default:
        return [
          { label: 'Try Again', action: 'retry', color: 'gray' },
          { label: 'Contact Support', to: '/contact', color: 'gray' }
        ];
    }
  };

  const colorClass = getErrorColor(error.errorCode);
  const bgColor = `bg-${colorClass}-50`;
  const borderColor = `border-${colorClass}-200`;
  const textColor = `text-${colorClass}-800`;
  const lightTextColor = `text-${colorClass}-700`;

  const sizeClasses = {
    small: 'p-3 text-xs',
    default: 'p-4 text-sm',
    large: 'p-6 text-base'
  };

  const handleAction = (action) => {
    switch (action) {
      case 'retry':
        if (onRetry) onRetry();
        break;
      case 'resendVerification':
        // Handle resend verification
        console.log('Resending verification email...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${bgColor} ${borderColor} border rounded-lg ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {getErrorIcon(error.errorCode)}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${textColor} ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'}`}>
            {error.message}
          </p>
          
          {/* Additional Info */}
          {error.attemptsRemaining !== undefined && (
            <p className={`mt-1 ${lightTextColor} ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
              <strong>{error.attemptsRemaining}</strong> attempts remaining
            </p>
          )}
          
          {error.timeRemaining && (
            <p className={`mt-1 ${lightTextColor} ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
              Try again in <strong>{error.timeRemaining} minutes</strong>
            </p>
          )}

          {/* Field-specific errors */}
          {error.errors && error.errors.length > 0 && (
            <div className="mt-2">
              <p className={`font-medium ${textColor} mb-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                Please fix the following:
              </p>
              <ul className={`${lightTextColor} space-y-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                {error.errors.map((err, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>{err.field}:</strong> {err.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-3">
              <p className={`font-medium ${textColor} mb-2 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                What you can do:
              </p>
              <ul className={`${lightTextColor} space-y-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
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
          {showQuickActions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {getQuickActions(error.errorCode).map((action, index) => (
                action.to ? (
                  <Link
                    key={index}
                    to={action.to}
                    className={`inline-flex items-center px-3 py-1 text-xs font-medium text-${action.color}-700 bg-${action.color}-100 rounded-full hover:bg-${action.color}-200 transition-colors`}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action)}
                    className={`inline-flex items-center px-3 py-1 text-xs font-medium text-${action.color}-700 bg-${action.color}-100 rounded-full hover:bg-${action.color}-200 transition-colors`}
                  >
                    {action.label}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Success message component for consistency
export const SuccessMessage = ({ 
  message, 
  className = '', 
  size = 'default',
  onDismiss
}) => {
  const sizeClasses = {
    small: 'p-3 text-xs',
    default: 'p-4 text-sm',
    large: 'p-6 text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-green-50 border border-green-200 rounded-lg ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-center">
        <CheckCircle2 className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} text-green-500 mr-2`} />
        <p className={`text-green-800 font-medium ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'}`}>
          {message}
        </p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Info message component
export const InfoMessage = ({ 
  message, 
  className = '', 
  size = 'default',
  icon
}) => {
  const sizeClasses = {
    small: 'p-3 text-xs',
    default: 'p-4 text-sm',
    large: 'p-6 text-base'
  };

  const IconComponent = icon || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-blue-50 border border-blue-200 rounded-lg ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-start">
        <IconComponent className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} text-blue-500 mr-2 mt-0.5`} />
        <div className={`text-blue-800 ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'}`}>
          {typeof message === 'string' ? (
            <p>{message}</p>
          ) : (
            message
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage; 