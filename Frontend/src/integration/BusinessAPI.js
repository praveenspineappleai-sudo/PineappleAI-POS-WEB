//BusinessAPI.js


///path:src/integration/BusinessAPI.js
//This file contains API calls related to business details, such as fetching business information based on the business name. 
export const getBusinessDetails = async (businessName) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://192.168.0.123:5000/api/business-details?business_name=${encodeURIComponent(businessName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch business details");
    }

    return await res.json();
  } catch (error) {
    console.error("Business details error:", error);
    return null;
  }
};
