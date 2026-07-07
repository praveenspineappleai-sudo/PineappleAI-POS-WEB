// CustomerAPI.js
import { getToken } from "./AuthAPI";
import Cookies from "js-cookie";

const API_BASE_URL = "'https://192.168.0.123:5000/api/customers";

/**
 * ✅ Create a new customer (POST request)
 */
export const createCustomer = async (customerData) => {
  try {
    const token = getToken();

    // 🔒 Token validation
    if (!token) {
      alert("Session expired! Please log in again.");
      return { success: false, error: "No token found" };
    }

    // 🔍 API call
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullname: customerData.name,
        email: customerData.email,
        phone_number: customerData.phone,
        address: customerData.address,
        business_id: Cookies.get("business_id"),
      }),
    });

    // ⚠️ Unauthorized
    if (response.status === 401) {
      console.warn("⚠️ Unauthorized or expired token");
      alert("Your session has expired. Please refresh or log in again.");
      return { success: false, error: "Unauthorized" };
    }

    const text = await response.text();
    console.log("🟢 Raw Server Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response (server may have returned HTML)");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to create customer");
    }

    console.log("✅ Customer created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Create Customer Error:", error);
    alert("Error creating customer: " + error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ✅ Fetch all customers (used for search bar)
 */
export const getAllCustomers = async () => {
  try {
    const token = getToken();
    if (!token) {
      alert("Session expired! Please log in again.");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.warn("⚠️ Unauthorized access - token expired");
      alert("Your session has expired. Please refresh or log in again.");
      return [];
    }

    const text = await response.text();
    console.log("🟢 Customer List Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response (server may have returned HTML)");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch customers");
    }

    return data.customers || [];
  } catch (error) {
    console.error("❌ Fetch Customers Error:", error);
    alert("Error fetching customers: " + error.message);
    return [];
  }
};

/**
 * 🔍 ✅ Search Customer (GET request)
 * API: /api/searchcustomers/customers/search?query=xxx
 */
export const searchCustomer = async (query) => {
  try {
    const token = getToken();
    if (!token) {
      alert("Session expired! Please log in again.");
      return [];
    }

    const response = await fetch(`http://192.168.0.123
:5000/api/searchcustomers/customers/search?query=${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ⚠ Unauthorized
    if (response.status === 401) {
      alert("Your session expired. Please log in again.");
      return [];
    }

    const text = await response.text();
    console.log("🟢 Search Customer Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response for search");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to search customers");
    }

    // 🔥 backend returns: { customers: [...] }
    return data.customers || [];
  } catch (error) {
    console.error("❌ Search Customer Error:", error);
    alert("Error searching customers: " + error.message);
    return [];
  }
};
