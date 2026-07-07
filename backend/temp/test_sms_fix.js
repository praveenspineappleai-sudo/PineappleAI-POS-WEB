const axios = require('axios');
const { sequelize } = require('../models');

async function testSmsFix() {
    try {
        console.log("Creating test customer with 9-digit phone (no 0)...");
        const phone = "770000000"; // 9 digits, common user input
        
        const [custId] = await sequelize.query(`INSERT INTO customers (name, phone_no, email, created_at, updated_at) VALUES ('SmsFixUser', '${phone}', NULL, NOW(), NOW())`);
        
        const payload = {
            products: [{ price_id: 122, ordered_quantity: 1 }],
            discounted_price: 50,
            business_name: "Keels",
            customer_id: custId,
            send_email: false
        };

        console.log("Sending Order Payload...");
        const response = await axios.post('http://localhost:5000/api/orders/create-order', payload);
        console.log("Order Response:", response.data);
        
        if (response.data.sms_sent) {
            console.log("✅ SMS Flag is TRUE");
        }

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) console.error("Data:", error.response.data);
    }
}

testSmsFix();
