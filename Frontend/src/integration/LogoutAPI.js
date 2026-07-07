// LogoutAPI.js
import Cookies from 'js-cookie';
import { clearAllCookies } from './AuthAPI';

const API_BASE_URL = 'http://192.168.0.123:5000/api/auth';
;

/**
 * Logout function - Clear local storage and call logout API
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      // If no token, just clear local data
      clearLocalData();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Clear local data regardless of API response
    clearLocalData();

    if (!response.ok) {
      throw new Error('Logout API call failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API call fails, clear local data
    clearLocalData();
    
    return {
      success: false,
      error: error.message || 'An error occurred during logout'
    };
  }
};

/**
 * Clear all local storage and cookies
 */
export const clearLocalData = () => {
  // Use the comprehensive clear function from AuthAPI
  clearAllCookies();
  
  // Additional clearing for completeness
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear any indexedDB databases (if used)
  if (window.indexedDB) {
    window.indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }).catch(console.error);
  }
  
  // Clear service worker cache (if used)
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!Cookies.get('token');
};