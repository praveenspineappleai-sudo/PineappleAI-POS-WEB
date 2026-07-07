// SizeAPI.js - Fixed API integration for sizes
import { getToken } from './AuthAPI';

const API_BASE_URL = 'http://192.168.0.123:5000/api';

/**
 * Fetch all sizes from the API
 * @returns {Promise<Array>} Array of size objects
 */
export const fetchSizes = async () => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication missing');
        }

        const response = await fetch(`${API_BASE_URL}/sizes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sizes fetched:', data);
        
        if (Array.isArray(data)) {
            return data;
        } else if (data.sizes && Array.isArray(data.sizes)) {
            return data.sizes;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching sizes:', error);
        throw error;
    }
};

/**
 * Create a new size
 * @param {string} sizeName - Name of the size to create
 * @returns {Promise<Object>} Created size object
 */
export const createSize = async (sizeName) => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication missing');
        }

        // Try with 'size' field (most common)
        const payload = {
            size: sizeName
        };

        console.log('Creating size:', payload);

        const response = await fetch(`${API_BASE_URL}/sizes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            // If 'size' doesn't work, try 'name'
            if (response.status === 400 && data.message?.includes('size')) {
                const altPayload = { name: sizeName };
                console.log('Trying alternative payload:', altPayload);
                
                const altResponse = await fetch(`${API_BASE_URL}/sizes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(altPayload),
                });
                
                const altData = await altResponse.json();
                
                if (!altResponse.ok) {
                    throw new Error(altData.message || altData.error || `HTTP error! status: ${altResponse.status}`);
                }
                
                console.log('Size created with alt payload:', altData);
                return altData;
            }
            
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Size created:', data);
        return data;
    } catch (error) {
        console.error('Error creating size:', error);
        throw error;
    }
};

export const getSizeName = (size) => {
    if (typeof size === 'string') return size;
    return size?.size || size?.name || '';
};

export default {
    fetchSizes,
    createSize,
    getSizeName,
};