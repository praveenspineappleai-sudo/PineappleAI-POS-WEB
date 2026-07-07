const axios = require('axios');

async function testCreateOrderNoCustomer() {
    try {
        const payload = {
            products: [
                { price_id: 122, ordered_quantity: 1 } 
            ],
            discounted_price: 100,
            business_name: "Keels",
            send_email: false,
            // customer_id is OMITTED
        };

        // Note: You might need a valid token if authentication is enabled. 
        // For local testing without auth middleware bypass, this might fail on 401.
        // Assuming we can test this or the user has a way to test.
        // If 401, we know the endpoint is hit at least.
        
        console.log("Sending payload:", payload);

        // Replace with your actual local server URL
        const response = await axios.post('http://localhost:5000/api/orders/create-order', payload);
        
        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error Response:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testCreateOrderNoCustomer();
