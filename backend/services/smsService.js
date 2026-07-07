const axios = require("axios");

/**
 * Send SMS using Notify.lk
 * @param {string} to - Phone number (e.g., 947XXXXXXXX)
 * @param {string} message - Message content
 */
const sendSMS = async (to, message) => {
  try {
    const USER_ID = process.env.NOTIFY_USER_ID;
    const API_KEY = process.env.NOTIFY_API_KEY;
    const SENDER_ID = process.env.NOTIFY_SENDER_ID || "NotifyDEMO";

    // Ensure phone number format (remove + if present)
    let formattedPhone = to.replace("+", "").trim();
    
    // Notify.lk expects 947XXXXXXXX. 
    // If it starts with 0, replace 0 with 94.
    // If it is 9 digits (7XXXXXXXX), prepend 94.
    if (formattedPhone.startsWith("0")) {
        formattedPhone = "94" + formattedPhone.substring(1);
    } else if (formattedPhone.length === 9) {
        formattedPhone = "94" + formattedPhone;
    }
    
    // URL Encode the message
    const encodedMessage = encodeURIComponent(message);

    const url = `https://app.notify.lk/api/v1/send?user_id=${USER_ID}&api_key=${API_KEY}&sender_id=${SENDER_ID}&to=${formattedPhone}&message=${encodedMessage}`;

    console.log(`📤 Sending SMS to ${formattedPhone}: ${message}`);
    const response = await axios.get(url);
    
    if (response.data && response.data.status === "success") {
        console.log("✅ SMS Sent Successfully:", response.data);
        return { success: true, data: response.data };
    } else {
        console.warn("⚠️ SMS API Response Error:", response.data);
        return { success: false, data: response.data };
    }

  } catch (error) {
    if (error.response) {
      console.error("❌ SMS API 400/500 Error:", error.response.status, error.response.data);
      return { success: false, error: error.message, details: error.response.data };
    }
    console.error("❌ Failed to send SMS:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Bill Link via SMS
 * @param {string} phone - Customer phone number
 * @param {string} orderNo - Order number
 * @param {string} businessName - Business Name
 */
const sendBillLink = async (phone, orderNo, businessName) => {
    // Construct the public link
    // Assuming the server is reachable at the host configured in env or hardcoded for now based on user context
    // Ideally this base URL should be in .env but I will use the one observed in server.js cors or default to relative
    
    // User mentioned: http://192.168.0.123:5000 or cloud URL. 
    // I'll try to find a best guess or use a placeholder that they can configure. 
    // For now, I'll use the local IP as per their request in the chat history context, or better, make it dynamic if possible.
    // But simpliest is:
    const baseUrl = "http://192.168.0.123:5000"; // Or https://pos-web-dev.pineappleai.cloud for prod
    const link = `${baseUrl}/api/public/bills/${orderNo}`;
    
    const message = `Thank you for shopping at ${businessName}. View your bill here: ${link}`;
    
    return await sendSMS(phone, message);
};

module.exports = { sendSMS, sendBillLink };
