// SearchProductAPI.js - Product Search API integration
import { getToken } from './AuthAPI';
import Cookies from 'js-cookie';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Search products by various filters
 * @param {Object} filters - Search filters
 * @param {string} filters.searchTerm - Search term for product name and barcode only
 * @param {string} filters.stockStatus - Stock status filter (low_stock, out_of_stock, in_stock)
 * @param {string} filters.category - Category filter
 * @returns {Promise<Array>} Array of filtered products
 */
export const searchProducts = async (filters = {}) => {
    try {
        const token = getToken();
        const businessId = Cookies.get('business_id');

        if (!token || !businessId) {
            throw new Error('Authentication missing');
        }

        // Build query parameters
        const params = new URLSearchParams({
            business_id: businessId
        });

        // Add search term filter for name and barcode only if provided
        if (filters.searchTerm && filters.searchTerm.trim()) {
            params.append('search', filters.searchTerm.trim());
        }

        // Add stock status filter if provided
        if (filters.stockStatus) {
            params.append('stock_status', filters.stockStatus);
        }

        // Add category filter if provided
        if (filters.category) {
            params.append('category', filters.category);
        }

        const apiUrl = `${API_BASE_URL}/products?${params.toString()}`;
        console.log('🔍 Search API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📥 Full API Response:', data);
        
        // The API returns an array directly based on your Postman output
        let products = [];
        
        if (Array.isArray(data)) {
            products = data;
            console.log('✅ Using direct array response');
        } else if (data && typeof data === 'object') {
            // Try common response structures
            if (data.data && Array.isArray(data.data)) {
                products = data.data;
                console.log('✅ Using data.data array');
            } else if (data.products && Array.isArray(data.products)) {
                products = data.products;
                console.log('✅ Using data.products array');
            } else if (data.items && Array.isArray(data.items)) {
                products = data.items;
                console.log('✅ Using data.items array');
            } else if (data.result && Array.isArray(data.result)) {
                products = data.result;
                console.log('✅ Using data.result array');
            } else {
                // If no array found, try to extract all array properties
                const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
                if (arrayKeys.length > 0) {
                    products = data[arrayKeys[0]];
                    console.log(`✅ Using data.${arrayKeys[0]} array`);
                } else {
                    console.log('❌ No array found in response object');
                    products = [];
                }
            }
        }
        
        console.log(`✅ Found ${products.length} products`);
        if (products.length > 0) {
            console.log('📦 Sample product:', products[0]);
        }
        
        return products;
        
    } catch (error) {
        console.error('❌ Error searching products:', error);
        throw error;
    }
};

/**
 * Search products by stock status
 * @param {string} stockStatus - Stock status (low_stock, out_of_stock, in_stock)
 * @returns {Promise<Array>} Array of products matching the stock status
 */
export const searchProductsByStockStatus = async (stockStatus) => {
    return searchProducts({ stockStatus });
};

/**
 * Search products by name and barcode only
 * @param {string} searchTerm - Search term for product name and barcode
 * @returns {Promise<Array>} Array of products matching the search term in name or barcode
 */
export const searchProductsByName = async (searchTerm) => {
    return searchProducts({ searchTerm });
};

/**
 * Search products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of products in the category
 */
export const searchProductsByCategory = async (category) => {
    return searchProducts({ category });
};

export default {
    searchProducts,
    searchProductsByStockStatus,
    searchProductsByName,
    searchProductsByCategory,
};