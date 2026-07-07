// src/contexts/ToastContext.js
import React, { createContext, useContext, useState } from 'react';
import '../styles/toastContext.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    isVisible: false,
    title: '',
    message: '',
    duration: 2000,
    type: 'success'
  });


  /// Function to show a toast notification with the specified title, message, type, and duration.
  const showToast = (title, message, type = 'success', duration = 2000) => {
    setToast({
      isVisible: true,
      title,
      message,
      duration,
      type
    });
  };
  /// Function to hide the currently visible toast notification.
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

 
  /// Component that renders the toast notification with the appropriate styling and content based on the type of notification (success, error, warning, info).
  const Toast = ({ title, message, duration, onClose, type = 'success' }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
      switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '✅';
      }
    };

    return (
      <div className={`toast-container toast-${type}`}>
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-content">
          <strong className="toast-title">{title}</strong>
          <p className="toast-message">{message}</p>
        </div>
      </div>
    );
  };



  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>

      {children}
      {toast.isVisible && (
        <Toast
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          type={toast.type}
          onClose={hideToast}
        />
      )}
        


    </ToastContext.Provider>
  );
};