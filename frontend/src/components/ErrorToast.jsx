import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const ErrorToast = ({ 
  message, 
  type = 'error', 
  isVisible = false, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: CheckCircle
        };
      case 'error':
      default:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertCircle
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
            <div className="flex items-start space-x-3">
              <Icon className={`h-5 w-5 ${styles.iconColor} mt-0.5 flex-shrink-0`} />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${styles.textColor}`}>
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className={`${styles.iconColor} hover:opacity-75 transition-opacity duration-200`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar for duration */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`mt-2 h-1 ${styles.iconColor.replace('text-', 'bg-')} opacity-30 rounded-full`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast; 