// SignupAPI.js 
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://192.168.0.123:5000/api';

// Set cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: true, // Only send over HTTPS
  sameSite: 'strict' // CSRF protection
};

// Phone number formatting helper
const formatPhoneNumberForAPI = (phoneNumber) => {
  console.log('Original phone number:', phoneNumber);

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If empty, return as is
  if (!cleaned) return phoneNumber;

  // Case 1: Already in +947XXXXXXXX format (12 characters)
  if (/^\+94\d{9}$/.test(cleaned)) {
    console.log('Phone already in correct format:', cleaned);
    return cleaned;
  }

  // Case 2: 947XXXXXXXX (without +)
  if (/^94\d{9}$/.test(cleaned)) {
    const formatted = '+' + cleaned;
    console.log('Added + prefix:', formatted);
    return formatted;
  }

  // Case 3: 07XXXXXXXX (Sri Lankan local format)
  if (/^0\d{9}$/.test(cleaned)) {
    const formatted = '+94' + cleaned.substring(1);
    console.log('Converted 0 to +94:', formatted);
    return formatted;
  }

  // Case 4: 7XXXXXXXX (without 0)
  if (/^7\d{8}$/.test(cleaned)) {
    const formatted = '+94' + cleaned;
    console.log('Added +94 prefix:', formatted);
    return formatted;
  }

  // Case 5: Has + but wrong format, try to fix
  if (cleaned.startsWith('+')) {
    const digits = cleaned.substring(1).replace(/\D/g, '');
    if (digits.length >= 9 && digits.startsWith('94')) {
      // Take only first 9 digits after +94
      const formatted = '+94' + digits.substring(2, 11);
      console.log('Fixed + format (truncated):', formatted);
      return formatted;
    }
  }

  // If none of the above, return original but clean it
  console.log('Could not format phone, returning cleaned version:', cleaned);
  return cleaned;
};

/**
 * Send email OTP for verification
 * @param {string} email - User email
 * @returns {Promise<Object>} API response
 */
export const sendEmailOTP = async (email) => {
  try {
    console.log('Sending OTP to email:', email);

    const response = await fetch(`${API_BASE_URL}/verify/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      }),
    });

    const data = await response.json();
    console.log('Send email OTP response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send OTP');
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Send email OTP error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while sending OTP'
    };
  }
};

/**
 * Verify email OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} API response
 */
export const verifyEmailOTP = async (email, otp) => {
  try {
    console.log('Verifying email OTP for:', email, 'with OTP:', otp);

    // Try different possible field name combinations
    const requestBody = {
      email: email,
      otp: otp,
      code: otp, // Some APIs use 'code' instead of 'otp'
      verification_code: otp // Some use 'verification_code'
    };
    
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_BASE_URL}/verify/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Email OTP verification response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Invalid verification code');
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Verify email OTP error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during email OTP verification'
    };
  }
};

/**
 * Send phone OTP for verification
 * @param {string} phoneNumber - User phone number
 * @returns {Promise<Object>} API response
 */
export const sendPhoneOTP = async (phoneNumber) => {
  try {
    // Format phone number before sending
    const formattedPhone = formatPhoneNumberForAPI(phoneNumber);
    console.log('Sending OTP to formatted phone:', formattedPhone);

    const response = await fetch(`${API_BASE_URL}/verify/send-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: formattedPhone
      }),
    });

    const data = await response.json();
    console.log('Send phone OTP response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send phone OTP');
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Send phone OTP error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while sending phone OTP'
    };
  }
};

/**
 * Verify phone OTP
 * @param {string} phoneNumber - User phone number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} API response
 */
export const verifyPhoneOTP = async (phoneNumber, otp) => {
  try {
    // Format phone number before verifying
    const formattedPhone = formatPhoneNumberForAPI(phoneNumber);
    console.log('Verifying phone OTP for:', formattedPhone, 'with OTP:', otp);

    // Try different possible field name combinations
    const requestBody = {
      phone_number: formattedPhone,
      phone: formattedPhone, // Some APIs might use 'phone'
      otp: otp,
      code: otp, // Some APIs use 'code' instead of 'otp'
      verification_code: otp // Some use 'verification_code'
    };
    
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_BASE_URL}/verify/verify-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Phone OTP verification response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Invalid phone verification code');
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during phone OTP verification'
    };
  }
};

/**
 * Register new user with all details
 * @param {Object} userData - Complete user registration data
 * @returns {Promise<Object>} API response
 */
export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);

    // Format phone number before sending
    const formattedPhone = formatPhoneNumberForAPI(userData.phone_number);
    
    const registrationData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      gender: userData.gender,
      dob: userData.dob, // Expected format: YYYY-MM-DD
      phone_number: formattedPhone,
      business_name: userData.business_name,
      business_address: userData.address, // API expects 'business_address', not 'address'
      role: "owner" // Required field - default to 'owner' for new registrations
    };

    console.log('Sending registration data:', registrationData);

    // Use the correct endpoint: /api/register
    const response = await fetch('http://192.168.0.123:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    console.log('Registration response status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Please check the API endpoint.');
    }
    
    const data = await response.json();
    console.log('Registration response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // Store user data in cookies/session if needed
    if (data.token) {
      Cookies.set('auth_token', data.token, COOKIE_OPTIONS);
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during registration'
    };
  }
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phoneNumber) => {
  console.log('Validating phone number:', phoneNumber);

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      message: 'Phone number is required',
      formatted: null
    };
  }

  // Check for correct format: +947XXXXXXXX (exactly 9 digits after +94)
  const exactMatch = /^\+94\d{9}$/.test(cleaned);
  if (exactMatch) {
    return {
      isValid: true,
      message: 'Valid phone number',
      formatted: cleaned
    };
  }

  // Check if it can be converted to correct format
  let formatted = null;
  let isValid = false;
  let message = 'Invalid phone number format. Use +947XXXXXXXX (9 digits after +94)';

  if (/^94\d{9}$/.test(cleaned)) {
    formatted = '+' + cleaned;
    isValid = true;
    message = 'Valid phone number (auto-formatted)';
  } else if (/^0\d{9}$/.test(cleaned)) {
    formatted = '+94' + cleaned.substring(1);
    isValid = true;
    message = 'Valid phone number (auto-formatted)';
  } else if (/^7\d{8}$/.test(cleaned)) {
    formatted = '+94' + cleaned;
    isValid = true;
    message = 'Valid phone number (auto-formatted)';
  } else if (cleaned.startsWith('+') && /^\+94\d+$/.test(cleaned)) {
    // Has +94 but check number of digits
    const digitsAfter94 = cleaned.substring(3).replace(/\D/g, '');
    if (digitsAfter94.length === 9) {
      formatted = cleaned;
      isValid = true;
      message = 'Valid phone number';
    } else if (digitsAfter94.length > 9) {
      // If more than 9 digits, truncate to 9
      formatted = '+94' + digitsAfter94.substring(0, 9);
      isValid = true;
      message = 'Valid phone number (auto-truncated)';
    } else if (digitsAfter94.length < 9) {
      message = 'Phone number too short. Use +947XXXXXXXX format (9 digits after +94)';
    }
  }

  // Final validation of formatted number
  if (formatted && /^\+94\d{9}$/.test(formatted)) {
    return {
      isValid: true,
      message: message,
      formatted: formatted
    };
  }

  return {
    isValid: false,
    message: message,
    formatted: null
  };
};

/**
 * Store phone number temporarily for verification process
 * @param {string} phoneNumber - User phone number
 */
export const setTempPhone = (phoneNumber) => {
  try {
    console.log('Setting temp phone:', phoneNumber);
    localStorage.setItem('temp_phone', phoneNumber);
    console.log('Temp phone stored:', localStorage.getItem('temp_phone'));
  } catch (error) {
    console.error('Error storing temp phone:', error);
  }
};

/**
 * Get stored temporary phone number
 * @returns {string|null} Temporary phone number
 */
export const getTempPhone = () => {
  try {
    const phone = localStorage.getItem('temp_phone');
    console.log('Retrieved temp phone:', phone);
    return phone;
  } catch (error) {
    console.error('Error retrieving temp phone:', error);
    return null;
  }
};

/**
 * Clear temporary phone number
 */
export const clearTempPhone = () => {
  try {
    localStorage.removeItem('temp_phone');
    console.log('Temp phone cleared');
  } catch (error) {
    console.error('Error clearing temp phone:', error);
  }
};

/**
 * Store email temporarily for verification process
 * @param {string} email - User email
 */
export const setTempEmail = (email) => {
  try {
    console.log('Setting temp email:', email);
    localStorage.setItem('temp_email', email);
    console.log('Temp email stored:', localStorage.getItem('temp_email'));
  } catch (error) {
    console.error('Error storing temp email:', error);
  }
};

/**
 * Get stored temporary email
 * @returns {string|null} Temporary email
 */
export const getTempEmail = () => {
  try {
    const email = localStorage.getItem('temp_email');
    console.log('Retrieved temp email:', email);
    return email;
  } catch (error) {
    console.error('Error retrieving temp email:', error);
    return null;
  }
};

/**
 * Clear temporary email
 */
export const clearTempEmail = () => {
  try {
    localStorage.removeItem('temp_email');
    console.log('Temp email cleared');
  } catch (error) {
    console.error('Error clearing temp email:', error);
  }
};

/**
 * Store complete signup data temporarily
 * @param {Object} data - Signup data to store
 */
export const setSignupData = (data) => {
  try {
    console.log('Storing complete signup data:', data);
    const dataToStore = JSON.stringify(data);
    localStorage.setItem('signup_data', dataToStore);
    
    // Verify storage
    const stored = localStorage.getItem('signup_data');
    console.log('Verification - Data stored successfully:', stored ? 'Yes' : 'No');
    if (stored) {
      console.log('Stored data:', JSON.parse(stored));
    }
  } catch (error) {
    console.error('Error storing signup data:', error);
  }
};

/**
 * Get stored signup data
 * @returns {Object|null} Stored signup data
 */
export const getSignupData = () => {
  try {
    const data = localStorage.getItem('signup_data');
    console.log('Retrieved raw signup data:', data);
    
    if (!data) {
      console.log('No signup data found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(data);
    console.log('Parsed signup data:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error retrieving signup data:', error);
    return null;
  }
};

/**
 * Update signup data with new fields
 * @param {Object} newData - New data to merge with existing data
 */
export const updateSignupData = (newData) => {
  try {
    const existingData = getSignupData() || {};
    const updatedData = { ...existingData, ...newData };
    console.log('Updating signup data:', updatedData);
    setSignupData(updatedData);
  } catch (error) {
    console.error('Error updating signup data:', error);
  }
};

/**
 * Clear all signup data
 */
export const clearSignupData = () => {
  try {
    clearTempEmail();
    clearTempPhone();
    localStorage.removeItem('signup_data');
    console.log('All signup data cleared');
  } catch (error) {
    console.error('Error clearing signup data:', error);
  }
};