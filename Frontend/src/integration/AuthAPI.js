// AuthAPI.js
import Cookies from 'js-cookie';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api/auth`;


// Set cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: false, // Only send over HTTPS
  sameSite: 'strict' // CSRF protection
};

// Development mode detection - more reliable method
const isDevelopment = () => {
  // Check multiple ways to detect development environment
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '3000' ||
    window.location.port === '5173' ||
    process.env.NODE_ENV === 'development' ||
    !process.env.NODE_ENV || // If not set, assume development
    window.location.protocol === 'http:'
  );
};

/**
 * Login function
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember me option
 * @returns {Promise<Object>} Login response with user data and tokens
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store user data and tokens in cookies (similar to AsyncStorage in mobile)
    if (data.user && data.accessToken) {
      // Store tokens in cookies
      Cookies.set('token', data.accessToken, COOKIE_OPTIONS);
      Cookies.set('refresh_token', data.refreshToken, COOKIE_OPTIONS);
      
      // Store user information in cookies
      Cookies.set('business_id', data.user.businessId.toString(), COOKIE_OPTIONS);
      Cookies.set('business_name', data.user.businessName, COOKIE_OPTIONS);
      Cookies.set('user_id', data.user.id.toString(), COOKIE_OPTIONS);
      Cookies.set('user_email', data.user.email, COOKIE_OPTIONS);
      Cookies.set('user_role', data.user.role, COOKIE_OPTIONS);

      // Also store in localStorage for easier access
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('business_name', data.user.businessName);

      
      // Set a session marker to detect dev server restarts
      if (isDevelopment()) {
        sessionStorage.setItem('dev_session_active', 'true');
      }
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during login'
    };
  }
};

/**
 * Logout function - Clear all authentication data
 */
export const logout = () => {
  clearAuthData();
};

/**
 * Clear authentication cookies and storage (but preserve signup data)
 */
export const clearAuthData = () => {
  // Clear authentication cookies
  Cookies.remove('token');
  Cookies.remove('refresh_token');
  Cookies.remove('business_id');
  Cookies.remove('business_name');
  Cookies.remove('user_id');
  Cookies.remove('user_email');
  Cookies.remove('user_role');
  
  // Clear localStorage authentication data only
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear all domain cookies for authentication
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear authentication-related cookies with various paths and domains
    if (['token', 'refresh_token', 'business_id', 'business_name', 'user_id', 'user_email', 'user_role'].includes(name)) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    }
  }
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('Authentication data cleared (signup data preserved)');
};

/**
 * Clear ALL data including signup data (use with caution)
 */
export const clearAllCookies = () => {
  clearAuthData();
  
  // Also clear localStorage (including signup data)
  localStorage.clear();
  
  console.log('All data cleared including signup data');
};

/**
 * Get stored token
 * @returns {string|null} Access token
 */
export const getToken = () => {
  // Try localStorage first for faster access
  const localStorageToken = localStorage.getItem('token');
  if (localStorageToken) return localStorageToken;
  
  // Fall back to cookies
  return Cookies.get('token') || null;
};

/**
 * Get stored refresh token
 * @returns {string|null} Refresh token
 */
export const getRefreshToken = () => {
  return Cookies.get('refresh_token') || null;
};

/**
 * Get user data
 * @returns {Object|null} User data
 */
export const getUserData = () => {
  const token = getToken();
  if (!token) return null;

  // Try to get from localStorage first
  const localStorageUser = localStorage.getItem('user');
  if (localStorageUser) {
    try {
      const user = JSON.parse(localStorageUser);
      return {
        id: user.id?.toString(),
        email: user.email,
        role: user.role,
        businessId: user.businessId?.toString(),
        businessName: user.businessName
      };
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }

  // Fall back to cookies
  return {
    id: Cookies.get('user_id'),
    email: Cookies.get('user_email'),
    role: Cookies.get('user_role'),
    businessId: Cookies.get('business_id'),
    businessName: Cookies.get('business_name')
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  // In development, also check if we have a valid session marker
  if (isDevelopment()) {
    const hasActiveSession = sessionStorage.getItem('dev_session_active') === 'true';
    if (!hasActiveSession) {
      // Clear any stale cookies if session marker is missing
      clearAuthData();
      return false;
    }
  }
  
  return !!getToken();
};

/**
 * Validate token on app startup to ensure it's still valid
 * @returns {Promise<boolean>} Whether token is valid
 */
export const validateTokenOnStartup = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    // For development: Check session marker and always return false on fresh start
    if (isDevelopment()) {
      const hasActiveSession = sessionStorage.getItem('dev_session_active') === 'true';
      
      if (!hasActiveSession) {
        console.log('Development: No active session found, forcing login page');
        // Clear any stale authentication data (but preserve signup data)
        clearAuthData();
        return false;
      }
      
      // If we have an active session, validate the token structure
      if (token && token.length > 10) {
        return true;
      }
      
      return false;
    }

    // For production: Basic token validation
    if (token && token.length > 10) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Initialize development session - Call this when app starts in development
 */
export const initializeDevSession = () => {
  if (isDevelopment()) {
    // Check if this is a fresh page load (no session marker)
    const hasActiveSession = sessionStorage.getItem('dev_session_active') === 'true';
    
    if (!hasActiveSession) {
      console.log('Development: Fresh start detected, clearing authentication data only');
      // Clear authentication data but preserve signup data
      clearAuthData();
    } else {
      console.log('Development: Active session found');
    }
  }
};

/**
 * Simple authentication check (for backward compatibility)
 * @returns {boolean} Authentication status
 */
export const checkAuth = () => {
  return isAuthenticated();
};