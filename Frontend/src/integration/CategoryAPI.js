// CategoryAPI.js - Complete updated API integration for categories with attributes
import { getToken } from './AuthAPI';
import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api`;

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
 * Create a new category with attributes
 * @param {string} categoryName - Name of the category to create
 * @param {Array} attributes - Array of attribute objects [{labelName, type, values}]
 * @returns {Promise<Object>} Created category object with attributes
 */
export const createCategory = async (categoryName, attributes = []) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        // First, create the category
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
                
                // If attributes are provided, create them after category creation
                if (attributes && attributes.length > 0 && altData.id) {
                    await createCategoryAttributes(altData.id, attributes);
                }
                
                return altData;
            }
            
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Category created:', data);

        // If attributes are provided, create them after category creation
        if (attributes && attributes.length > 0 && data.id) {
            await createCategoryAttributes(data.id, attributes);
        }

        return data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Create category with attributes in one API call
 * @param {Object} categoryData - Category data with name and attributes
 * @returns {Promise<Object>} Created category with attributes
 */
export const createCategoryWithAttributes = async (categoryData) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const payload = {
            category_name: categoryData.categoryName,
            attributes: categoryData.attributes || []
        };

        console.log('Creating category with attributes:', payload);

        const response = await fetch(`${API_BASE_URL}/categories/with-attributes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Category with attributes created:', data);
        return data;
    } catch (error) {
        console.error('Error creating category with attributes:', error);
        throw error;
    }
};

/**
 * Create attributes for a category
 * @param {number} categoryId - Category ID
 * @param {Array} attributes - Array of attribute objects
 * @returns {Promise<Array>} Created attributes
 */
export const createCategoryAttributes = async (categoryId, attributes) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        // Format attributes for API
        const formattedAttributes = attributes.map(attr => ({
            attribute_name: attr.labelName,
            attribute_type: attr.type || 'text',
            is_required: true,
            values: attr.values || []
        }));

        const payload = { attributes: formattedAttributes };

        console.log(`Creating ${attributes.length} attributes for category ${categoryId}:`, payload);

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Attributes created successfully:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error creating category attributes:', error);
        throw error;
    }
};

/**
 * Save category attributes to database
 * @param {number} categoryId - Category ID
 * @param {Array} attributes - Array of attribute objects
 * @returns {Promise<Array>} Created attributes
 */
export const saveCategoryAttributes = async (categoryId, attributes) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const payload = { attributes };

        console.log(`Saving attributes for category ${categoryId}:`, payload);

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Attributes saved:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error saving category attributes:', error);
        throw error;
    }
};

/**
 * Create attributes for a category (bulk) - Alias for saveCategoryAttributes
 * @param {number} categoryId - Category ID
 * @param {Array} attributes - Array of attribute objects with attribute_name and attribute_type
 * @returns {Promise<Array>} Created attributes
 */
export const createAttributesBulk = async (categoryId, attributes) => {
    return saveCategoryAttributes(categoryId, attributes);
};

/**
 * Get all attributes for a category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of attribute objects
 */
export const getCategoryAttributes = async (categoryId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching category attributes:', error);
        return [];
    }
};

/**
 * Get attribute values for a category
 * @param {number} categoryId - Category ID
 * @param {string} attributeName - Attribute name
 * @returns {Promise<Array>} Array of attribute values
 */
export const getAttributeValues = async (categoryId, attributeName) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes/${encodeURIComponent(attributeName)}/values`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching attribute values:', error);
        return [];
    }
};

/**
 * Add value to attribute
 * @param {number} attributeId - Attribute ID
 * @param {string} value - Value to add
 * @returns {Promise<Object>} Added value
 */
export const addAttributeValue = async (attributeId, value) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const payload = { value };

        const response = await fetch(`${API_BASE_URL}/attributes/${attributeId}/values`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data.data;
    } catch (error) {
        console.error('Error adding attribute value:', error);
        throw error;
    }
};

/**
 * Delete an attribute
 * @param {number} attributeId - Attribute ID
 * @returns {Promise<Object>} Response data
 */
export const deleteAttribute = async (attributeId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/attributes/${attributeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error deleting attribute:', error);
        throw error;
    }
};

/**
 * Delete attribute value
 * @param {number} valueId - Value ID
 * @returns {Promise<Object>} Response data
 */
export const deleteAttributeValue = async (valueId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/attribute-values/${valueId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error deleting attribute value:', error);
        throw error;
    }
};

/**
 * Update an attribute
 * @param {number} attributeId - Attribute ID
 * @param {Object} attributeData - Updated attribute data
 * @returns {Promise<Object>} Updated attribute
 */
export const updateAttribute = async (attributeId, attributeData) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/attributes/${attributeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(attributeData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data.data;
    } catch (error) {
        console.error('Error updating attribute:', error);
        throw error;
    }
};

/**
 * Get category name from category object
 * @param {Object|string} category - Category object or string
 * @returns {string} Category name
 */
export const getCategoryName = (category) => {
    if (typeof category === 'string') return category;
    return category?.category_name || category?.name || '';
};

/**
 * Get category ID from category object
 * @param {Object} category - Category object
 * @returns {number|null} Category ID
 */
export const getCategoryId = (category) => {
    if (!category) return null;
    return category.id || null;
};

/**
 * Get category by name
 * @param {string} categoryName - Category name to search
 * @returns {Promise<Object|null>} Category object or null
 */
export const getCategoryByName = async (categoryName) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/name/${encodeURIComponent(categoryName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching category by name:', error);
        return null;
    }
};

/**
 * Get category with attributes by ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object with attributes
 */
export const getCategoryWithAttributes = async (categoryId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/with-attributes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching category with attributes:', error);
        return null;
    }
};

/**
 * Update category
 * @param {number} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

/**
 * Delete category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} Response data
 */
export const deleteCategory = async (categoryId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Authentication missing');

        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    fetchCategories,
    createCategory,
    createCategoryWithAttributes,
    createCategoryAttributes,
    saveCategoryAttributes,
    createAttributesBulk,
    getCategoryAttributes,
    getAttributeValues,
    addAttributeValue,
    deleteAttribute,
    deleteAttributeValue,
    updateAttribute,
    getCategoryName,
    getCategoryId,
    getCategoryByName,
    getCategoryWithAttributes,
    updateCategory,
    deleteCategory,
};