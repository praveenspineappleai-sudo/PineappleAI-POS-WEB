// ColorsAPI.js - Fixed API integration for colors
import { getToken } from './AuthAPI';

const API_BASE_URL = 'http://192.168.0.123:5000/api';
/**
 * Fetch all colors from the API
 * @returns {Promise<Array>} Array of color objects
 */
export const fetchColors = async () => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication missing');
        }

        const response = await fetch(`${API_BASE_URL}/colors/colors`, {
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
        console.log('Colors fetched:', data);
        
        // Return the colors array
        if (Array.isArray(data)) {
            return data;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching colors:', error);
        throw error;
    }
};

/**
 * Create a new color
 * @param {string} colorName - Name of the color to create
 * @returns {Promise<Object>} Created color object
 */
export const createColor = async (colorName) => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication missing');
        }

        const payload = {
            colour_name: colorName
        };

        console.log('Creating color:', payload);

        const response = await fetch(`${API_BASE_URL}/colors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        // First check if response is HTML (error page)
        const responseText = await response.text();
        
        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response as JSON:', responseText.substring(0, 100));
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Color created:', data);
        return data;
    } catch (error) {
        console.error('Error creating color:', error);
        throw error;
    }
};

export const getColorName = (color) => {
    if (typeof color === 'string') return color;
    return color?.colour_name || color?.name || '';
};

export const getColorId = (color) => {
    if (!color) return null;
    if (typeof color === 'object') {
        return color.id || color.colour_id || color.color_id;
    }
    return null;
};

export default {
    fetchColors,
    createColor,
    getColorName,
    getColorId,
};