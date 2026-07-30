const axios = require('axios');

const BASE_URL = 'http://pos-web-dev.pineappleai.cloud/api';

async function verify() {
    try {
        // 1. Create a Product
        const productPayload = {
            name: `TestProduct_${Date.now()}`,
            description: "Test Description",
            categorys_id: 1, // Assumption: category 1 exists
            business_id: 1 // Assumption: business 1 exists
        };

        console.log("Creating product...");
        let productId;
        try {
            const productRes = await axios.post(`${BASE_URL}/products/add-product`, productPayload);
            productId = productRes.data.product_id;
            console.log("Product Created ID:", productId);
        } catch (e) {
            console.error("Product Creation Failed:", e.response ? e.response.data : e.message);
            // If we can't create, maybe we can't do anything. 
            // But maybe the DB is empty?
            return;
        }

        // 2. Add Pricing with Manual Barcode
        const manualBarcode = `MANUAL_${Date.now()}`;
        const pricingPayload = {
            product_id: productId,
            variations: [
                {
                    color_id: 1, // Assumption: color 1 exists
                    size_id: 1, // Assumption: size 1 exists
                    quantity: 10,
                    cost_price: 100,
                    selling_price: 150,
                    barcode: manualBarcode
                }
            ]
        };

        console.log(`Adding pricing with manual barcode: ${manualBarcode}...`);
        try {
            const pricingRes = await axios.post(`${BASE_URL}/products/add-pricing`, pricingPayload);
            console.log("Pricing Added Response:", pricingRes.data);
        } catch (e) {
            console.error("Pricing Addition Failed:", e.response ? e.response.data : e.message);
            return;
        }

        // 3. Verify via GET /api/barcodes
        console.log("Verifying barcode existence via GET /api/barcodes...");
        try {
            const barcodesRes = await axios.get(`${BASE_URL}/barcodes`);
            const found = barcodesRes.data.find(b => b.barcode_no === manualBarcode);

            if (found) {
                console.log("SUCCESS: Manual barcode found in database!");
                console.log("Barcode Details:", found);
            } else {
                console.error("FAILURE: Manual barcode NOT found in database.");
            }
        } catch (e) {
            console.error("Verification Failed:", e.response ? e.response.data : e.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error);
    }
}

verify();
