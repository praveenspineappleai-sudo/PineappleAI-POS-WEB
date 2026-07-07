const axios = require('axios');
const { sequelize } = require('../models');

async function testFinalBill() {
    try {
        console.log("Creating test order with cashier name...");
        const orderNo = "TEST-REFINED-" + Date.now();
        
        // Mock data
        const payload = {
            products: [
                { price_id: 122, ordered_quantity: 2 },
                { price_id: 122, ordered_quantity: 1 },
                { price_id: 122, ordered_quantity: 5 }
            ],
            discounted_price: 150.50,
            business_name: "Keels",
            cashier_name: "John Doe",
            send_email: false
        };

        const response = await axios.post('http://localhost:5000/api/orders/create-order', payload);
        const realOrderNo = response.data.order_no;
        console.log("Order Created:", realOrderNo);
        
        // 2. Test Public Bill Link with width 58
        console.log(`Testing Public Link (58mm): http://localhost:5000/api/public/bills/${realOrderNo}?width=58`);
        const pdfRes = await axios.get(`http://localhost:5000/api/public/bills/${realOrderNo}?width=58`, { responseType: 'arraybuffer' });
        
        console.log("PDF Content-Type:", pdfRes.headers['content-type']);
        console.log("PDF Size:", pdfRes.data.length);
        
        if (pdfRes.data.length < 5000) {
            console.log("✅ PDF size seems compact (no long gap)");
        } else {
            console.log("⚠️ PDF size still large?");
        }

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            // Re-throw to see full 500 data
            console.error("Error Detail:", Buffer.from(error.response.data).toString());
        }
    }
}

testFinalBill();
