import React from 'react';
import ErrorToast from './ErrorToast';

const ToastContainer = ({ toasts, onHideToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <ErrorToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          duration={0} // Disable auto-hide since we manage it in the hook
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 