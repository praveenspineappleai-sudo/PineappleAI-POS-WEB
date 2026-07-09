// AccountManagementAPI.js
import Cookies from 'js-cookie';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Fetch user profile information
 * @returns {Promise<Object>} Profile data including username
 */
export const fetchUserProfile = async () => {
  try {
    const businessId = Cookies.get('business_id');
    const token = Cookies.get('token');

    if (!businessId) {
      throw new Error('Business ID not found');
    }

    const response = await fetch(`${API_BASE_URL}/profile?business_id=${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while fetching profile'
    };
  }
};

/**
 * Fetch all cashiers for the business
 * @returns {Promise<Object>} List of cashiers
 */
export const fetchCashiers = async () => {
  try {
    const businessId = Cookies.get('business_id');
    const token = Cookies.get('token');

    if (!businessId) {
      throw new Error('Business ID not found');
    }

    const response = await fetch(
      `${API_BASE_URL}/cashier/cashiers?business_id=${businessId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch cashiers');
    }

    return {
      success: true,
      data: data.cashiers || []
    };

  } catch (error) {
    console.error('Error fetching cashiers:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while fetching cashiers',
      data: []
    };
  }
};

/**
 * Delete a cashier
 * @param {number} cashierId - ID of the cashier to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteCashier = async (cashierId) => {
  try {
    const token = Cookies.get('token');

    const response = await fetch(`${API_BASE_URL}/cashier/cashier/${cashierId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete cashier');
    }

    return {
      success: true,
      message: 'Cashier deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting cashier:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while deleting cashier'
    };
  }
};