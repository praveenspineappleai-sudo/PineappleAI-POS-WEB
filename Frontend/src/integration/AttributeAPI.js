import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://pos-web-dev.pineappleai.cloud/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Get all attributes for a category
export const getCategoryAttributes = async (categoryId) => {
    try {
        const response = await api.get(`/categories/${categoryId}/attributes`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching category attributes:', error);
        throw error;
    }
};

// Create attribute for a category
export const createAttribute = async (categoryId, attributeData) => {
    try {
        const response = await api.post(`/categories/${categoryId}/attributes`, attributeData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating attribute:', error);
        throw error;
    }
};

// Create multiple attributes for a category
export const createAttributesBulk = async (categoryId, attributes) => {
    try {
        const response = await api.post(`/categories/${categoryId}/attributes/bulk`, { attributes });
        return response.data.data;
    } catch (error) {
        console.error('Error creating attributes in bulk:', error);
        throw error;
    }
};

// Update attribute
export const updateAttribute = async (attributeId, attributeData) => {
    try {
        const response = await api.put(`/attributes/${attributeId}`, attributeData);
        return response.data.data;
    } catch (error) {
        console.error('Error updating attribute:', error);
        throw error;
    }
};

// Delete attribute
export const deleteAttribute = async (attributeId) => {
    try {
        const response = await api.delete(`/attributes/${attributeId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting attribute:', error);
        throw error;
    }
};

// Save product attribute values
export const saveProductAttributes = async (productId, attributes) => {
    try {
        const response = await api.post(`/products/${productId}/attributes`, { attributes });
        return response.data.data;
    } catch (error) {
        console.error('Error saving product attributes:', error);
        throw error;
    }
};

// Get product attribute values
export const getProductAttributes = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}/attributes`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching product attributes:', error);
        throw error;
    }
};

// Get attribute by name for a category
export const getAttributeByName = async (categoryId, attributeName) => {
    try {
        const response = await api.get(`/categories/${categoryId}/attributes/name/${attributeName}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching attribute by name:', error);
        return null;
    }
};