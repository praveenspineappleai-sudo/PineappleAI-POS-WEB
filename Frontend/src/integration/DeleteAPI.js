// DeleteAPI.js - Product Delete API integration
import { getToken } from './AuthAPI';
import Cookies from 'js-cookie';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Delete a product by its price ID
 * @param {number} priceId - The price ID of the product to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteProduct = async (priceId) => {
    try {
        const token = getToken();
        const businessId = Cookies.get('business_id');

        if (!token || !businessId) {
            throw new Error('Authentication missing. Please log in again.');
        }

        console.log(`🗑️ Deleting product with price ID: ${priceId}`);

        const response = await fetch(`${API_BASE_URL}/products/delete-price/${priceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            // If response is not JSON, handle it
            if (response.ok) {
                responseData = { message: 'Product deleted successfully' };
            } else {
                throw new Error('Server returned invalid response');
            }
        }

        console.log('📥 Delete response:', responseData);

        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || 'Failed to delete product');
        }

        return {
            success: true,
            message: responseData.message || 'Product deleted successfully',
            data: responseData
        };

    } catch (error) {
        console.error('❌ Delete Product Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while deleting the product'
        };
    }
};

/**
 * Delete multiple products by their price IDs
 * @param {Array<number>} priceIds - Array of price IDs to delete
 * @returns {Promise<Object>} Delete response with results for each deletion
 */
export const deleteMultipleProducts = async (priceIds) => {
    try {
        const results = await Promise.all(
            priceIds.map(priceId => deleteProduct(priceId))
        );

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        return {
            success: failureCount === 0,
            message: `Deleted ${successCount} products successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
            results: results
        };

    } catch (error) {
        console.error('❌ Delete Multiple Products Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while deleting products'
        };
    }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    deleteProduct,
    deleteMultipleProducts,
};