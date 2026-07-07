// CategoryAPI.js - Fixed API integration for categories
import { getToken } from './AuthAPI';

const API_BASE_URL = 'http://192.168.0.123:5000/api';

/**
 * Fetch all categories from the API
 * @returns {Promise<Array>} Array of category objects
 */
export const fetchCategories = async () => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication missing');
        }

        const response = await fetch(`${API_BASE_URL}/categories`, {
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
        console.log('Categories fetched:', data);
        
        if (Array.isArray(data)) {
            return data;
        } else if (data.categories && Array.isArray(data.categories)) {
            return data.categories;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Create a new category - SIMILAR to colors endpoint
 * @param {string} categoryName - Name of the category to create
 * @returns {Promise<Object>} Created category object
 */
export const createCategory = async (categoryName) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        // ✅ USE ONE PAYLOAD KEY ONLY
        const payload = {
           category_name: categoryName,

        };

        console.log('Creating category:', payload);

        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            // If category_name doesn't work, try with just 'name'
            if (response.status === 400 && data.message?.includes('category_name')) {
                // Try alternative payload
                const altPayload = { name: categoryName };
                console.log('Trying alternative payload:', altPayload);
                
                const altResponse = await fetch(`${API_BASE_URL}/categories`, {
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
                
                console.log('Category created with alt payload:', altData);
                return altData;
            }
            
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Category created:', data);
        return data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};


export const getCategoryName = (category) => {
    if (typeof category === 'string') return category;
    return category?.category_name || category?.name || '';
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    fetchCategories,
    createCategory,
    getCategoryName,
};