// src/integration/OrderAPI.js
import { getToken } from "./AuthAPI";
import Cookies from "js-cookie";

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const ORDER_BASE_URL = `${BASE_URL}/api/orders`;
const SALES_BASE_URL = `${BASE_URL}/api/sales`;

/**
 * 🧾 ✅ Create Order (POST)
 * API: /api/orders/create-order
 */
export const createOrder = async (orderData) => {
  try {
    const token = getToken();

    if (!token) {
      alert("Session expired! Please log in again.");
      return { success: false, error: "Token missing" };
    }

    // Final Payload
    const finalPayload = {
      ...orderData,
      business_id: Cookies.get("business_id") || null,
    };

    console.log("📦 Sending Order Payload:", finalPayload);

    const response = await fetch(`${ORDER_BASE_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(finalPayload),
    });

    if (response.status === 401) {
      alert("Your session expired. Please login again.");
      return { success: false, error: "Unauthorized" };
    }

    const text = await response.text();
    console.log("🟢 Raw Order Create Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error("Invalid JSON response from create order API");
    }

    if (!response.ok) {
      throw new Error(data.message || "Order creation failed");
    }

    console.log("✅ Order created successfully:", data);
    window.dispatchEvent(new Event("orderCreated"));
    return { success: true, data };

  } catch (error) {
    console.error("❌ Create Order Error:", error);
    alert("Error creating order: " + error.message);
    return { success: false, error: error.message };
  }
};


/**
 * 🧾 🔍 Get Bill By ID (GET)
 * API: /api/orders/bills/{billId}
 */
export const getBillById = async (billId) => {
  try {
    const token = getToken();

    if (!token) {
      alert("Session expired! Please log in again.");
      return null;
    }

    const url = `${ORDER_BASE_URL}/bills/${billId}`;
    console.log("🔍 Fetching Bill From:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      alert("Your session expired. Please log in again.");
      return null;
    }

    const text = await response.text();
    console.log("🟢 Bill Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response for bill");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch bill");
    }

    return data;

  } catch (error) {
    console.error("❌ Fetch Bill Error:", error);
    alert("Error fetching bill: " + error.message);
    return null;
  }
};


/**
 * 📋 🟦 Fetch All Orders From Cashier Page (Completed Orders)
 * API: /api/orders/get-orders
 */
export const getOrdersList = async () => {
  try {
    const token = getToken();

    if (!token) {
      alert("Session expired! Please log in again.");
      return [];
    }

    const url = `${ORDER_BASE_URL}/get-orders`;
    console.log("📋 Fetching Order List:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      alert("Your session expired. Please log in again.");
      return [];
    }

    const text = await response.text();
    console.log("🟢 Order List Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response for order list");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch orders");
    }

    // normalize different data structures
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.orders)) return data.orders;
    if (Array.isArray(data.data)) return data.data;

    return [];
  } catch (error) {
    return [];
  }
};



/**
 * 📊 🟩 FETCH Monthly Sales Stats (Your Existing API)
 * API: /api/sales/stats
 */
export const getSalesStats = async () => {
  try {
    const token = getToken();

    if (!token) {
      return [];
    }

    const businessName = localStorage.getItem('business_name') || 'PAI FOOD CITY';
    const url = `${SALES_BASE_URL}/stats?period=monthly&business_name=${encodeURIComponent(businessName)}`;
    console.log("📊 Fetching Sales Stats:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await response.text();
    console.log("🟢 Raw Sales Stats:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response from sales API");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch sales stats");
    }

    return data;

  } catch (error) {
    console.error("❌ Sales Stats Error:", error);
    return [];
  }
};



/**
 * 🟣 ⭐ MERGED API → Orders from Cashier + Orders from Sales Stats
 * 👉 Sales Page இதை மட்டும் use பண்ணலாம்
 */
export const getMergedOrders = async () => {
  try {
    const cashierOrders = await getOrdersList();  // API 1
    const salesStats = await getSalesStats();     // API 2

    const salesOrders = salesStats.orders || [];  // if available

    const merged = [...cashierOrders, ...salesOrders];

    console.log("🟣 FINAL MERGED ORDERS:", merged);

    return merged;
  } catch (err) {
    console.error("❌ Merge Error:", err);
    return [];
  }
};