// App.js - Main Application Component
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { validateTokenOnStartup, initializeDevSession } from './integration/AuthAPI';
import AppRoutes from './routes/AppRoute';

import './App.css';

/**
 * App Initializer Component - Handles authentication check on startup
 */
const AppInitializer = ({ children }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Initialize development session first (clears auth data if fresh start)
        initializeDevSession();
        
        // Then validate token
        await validateTokenOnStartup();
        
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuthentication();
  }, []);

  // Show loading spinner while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Main App Component
 */
function App() {
  return (
    <ToastProvider>
      <Router>
        <AppInitializer>
          <div className="App">
            <AppRoutes />
          </div>
        </AppInitializer>
      </Router>
    </ToastProvider>
  );
}

export default App;