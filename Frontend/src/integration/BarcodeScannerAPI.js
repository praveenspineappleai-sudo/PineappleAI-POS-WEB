// BarcodeScannerAPI.js - Handle missing barcode images gracefully
import { getToken } from './AuthAPI';
import Cookies from 'js-cookie';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api`;


/**
 * Fetch product details by ID including barcode information
 * @param {number} productId - Product ID
 * @param {Object} variantData - Variant data (color, size, etc.)
 * @returns {Promise<Object>} Product data with barcode
 */
export const fetchProductWithBarcode = async (productId, variantData = null) => {
    try {
        const token = getToken();
        const businessId = Cookies.get('business_id');

        if (!token || !businessId) {
            throw new Error('Authentication missing. Please log in again.');
        }

        console.log(`📡 Fetching product details for ID: ${productId}`, variantData);

        const response = await fetch(`${API_BASE_URL}/products/get-product/${productId}`, {
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
        console.log('📥 Product barcode response:', data);

        // Extract barcode information from the response with variant support - NO FALLBACK
        const barcodeData = extractBarcodeData(data, variantData);
        
        // If no barcode found, return error
        if (!barcodeData || !barcodeData.barcodeNo) {
            throw new Error('No barcode found for this product');
        }
        
        return {
            success: true,
            product: data,
            barcode: barcodeData
        };

    } catch (error) {
        console.error('❌ Error fetching product barcode:', error);
        
        // NO FALLBACK - Return error
        return {
            success: false,
            error: error.message || 'Failed to fetch product barcode',
            barcode: null
        };
    }
};

/**
 * Fetch barcode image by barcode ID (like mobile app)
 * @param {number} barcodeId - Barcode ID
 * @returns {Promise<Object>} Barcode image data
 */
export const fetchBarcodeImage = async (barcodeId) => {
    try {
        const token = getToken();
        const businessId = Cookies.get('business_id');

        if (!token || !businessId) {
            throw new Error('Authentication missing. Please log in again.');
        }

        if (!barcodeId) {
            throw new Error('Barcode ID is required');
        }

        console.log(`🖼️ Fetching barcode image for ID: ${barcodeId}`);

        // Use the exact endpoint format from mobile app
        const imageUrl = `${API_BASE_URL}/products/barcode/image/${barcodeId}`;

        const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // Return graceful failure instead of throwing
            console.warn(`⚠️ Barcode image not found (404) for ID: ${barcodeId}`);
            return {
                success: false,
                error: `Barcode image not available (HTTP ${response.status})`,
                imageUrl: null
            };
        }

        // Check if response is an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            // Create blob URL for the image
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            return {
                success: true,
                imageUrl: imageUrl,
                barcodeId: barcodeId
            };
        } else {
            console.warn('⚠️ Response is not an image');
            return {
                success: false,
                error: 'Response is not an image',
                imageUrl: null
            };
        }

    } catch (error) {
        console.error('❌ Error fetching barcode image:', error);
        // Return graceful failure
        return {
            success: false,
            error: error.message || 'Failed to fetch barcode image',
            imageUrl: null
        };
    }
};

/**
 * Extract barcode data from product API response with variant support - NO FALLBACK
 * @param {Object} productData - Product data from API
 * @param {Object} variantData - Variant data (color, size)
 * @returns {Object|null} Barcode information or null if not found
 */
const extractBarcodeData = (productData, variantData = null) => {
    try {
        // If variant data is provided, try to find specific variant barcode
        if (variantData && variantData.color && variantData.size) {
            console.log('🔍 Looking for variant-specific barcode:', variantData);
            
            // Check if product has multiple prices/variants
            if (productData.Prices && productData.Prices.length > 0) {
                // Try to find the specific variant
                const variantPrice = productData.Prices.find(price => {
                    const priceColor = getColorFromPrice(price);
                    const priceSize = getSizeFromPrice(price);
                    
                    return priceColor === variantData.color && priceSize === variantData.size;
                });
                
                if (variantPrice && variantPrice.Barcode) {
                    console.log('✅ Found variant-specific barcode');
                    return {
                        barcodeNo: variantPrice.Barcode.barcode_no,
                        barcodeImage: variantPrice.Barcode.barcode_image || '',
                        barcodeId: variantPrice.Barcode.id || null
                    };
                }
            }
        }
        
        // Try to get first available barcode - NO generation
        if (productData.Prices && productData.Prices.length > 0) {
            const firstPrice = productData.Prices[0];
            
            // Get barcode from Barcode object if available
            if (firstPrice.Barcode && firstPrice.Barcode.barcode_no) {
                return {
                    barcodeNo: firstPrice.Barcode.barcode_no,
                    barcodeImage: firstPrice.Barcode.barcode_image || '',
                    barcodeId: firstPrice.Barcode.id || null
                };
            }
            
            // Try barcode_id field
            if (firstPrice.barcode_id) {
                return {
                    barcodeNo: firstPrice.barcode_id.toString(),
                    barcodeImage: '',
                    barcodeId: firstPrice.barcode_id
                };
            }
        }
        
        // NO FALLBACK - Return null if no barcode found
        console.log('❌ No barcode found in product data');
        return null;
        
    } catch (error) {
        console.error('Error extracting barcode data:', error);
        return null;
    }
};

/**
 * Extract color from price object
 * @param {Object} price - Price object
 * @returns {string} Color name
 */
const getColorFromPrice = (price) => {
    if (price.color_name) return price.color_name;
    if (price.color && price.color.colour_name) return price.color.colour_name;
    if (price.Color && price.Color.colour_name) return price.Color.colour_name;
    return 'Default';
};

/**
 * Extract size from price object
 * @param {Object} price - Price object
 * @returns {string} Size name
 */
const getSizeFromPrice = (price) => {
    if (price.size_name) return price.size_name;
    if (price.size) return price.size;
    if (price.Size && price.Size.size) return price.Size.size;
    return 'Default';
};

export default {
    fetchProductWithBarcode,
    fetchBarcodeImage,
};