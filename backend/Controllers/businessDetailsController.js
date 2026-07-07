// controllers/businessDetailsController.js
const db = require("../models");

/**
 * Get business details including address and owner phone
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBusinessDetails = async (req, res) => {
  try {
    const { business_name } = req.query;

    if (!business_name) {
      return res.status(400).json({ message: "Business name is required" });
    }

    console.log("🔍 Fetching business details for:", business_name);
    console.log("👤 User requesting:", req.user_id, "Role:", req.role);

    const { Op } = require("sequelize"); // Import Op

    console.log("🔍 Fetching business details for:", business_name);
    console.log("👤 User requesting:", req.user_id, "Role:", req.role);

    // Find business by name with owner details - Try exact match first
    let business = await db.BusinessDetail.findOne({
      where: { name: business_name },
      include: [
        {
          model: db.OwnerDetail,
          as: "owner",
          attributes: ["phone_number", "name"],
        },
      ],
      attributes: ["name", "address", "owner_id"], // Added owner_id for debug
    });

    // If not found, try case-insensitive/fuzzy search
    if (!business) {
        console.log("⚠️ Exact match not found, trying fuzzy search...");
        business = await db.BusinessDetail.findOne({
          where: { 
            name: { [Op.like]: `%${business_name}%` } 
          },
          include: [
            {
              model: db.OwnerDetail,
              as: "owner",
              attributes: ["phone_number", "name"],
            },
          ],
          attributes: ["name", "address", "owner_id"],
        });
    }

    if (business) {
        console.log("✅ Business Record Found:", JSON.stringify(business.toJSON(), null, 2));
    }

    if (!business) {
        console.warn("⚠️ Business not found in DB for name:", business_name);
        return res.status(404).json({ message: "Business not found" });
    }

    console.log("✅ Business found:", business.name);

    // Return formatted response
    let response = {
      business_name: business.name,
      address: business.address,
      owner_phone: business.owner?.phone_number || null,
      owner_name: business.owner?.name || null,
      cashier_name: null,
    };

    // If logged in user is a cashier, fetch their details
    if (req.role === "cashier" && req.user_id) {
      console.log("🔎 Fetching cashier details for user_id:", req.user_id);
      const cashier = await db.CashierDetail.findOne({
        where: { user_id: req.user_id },
        attributes: ["fullname"],
      });
      
      if (cashier) {
        console.log("✅ Cashier found:", cashier.fullname);
        response.cashier_name = cashier.fullname;
      } else {
        console.warn("⚠️ Cashier record not found for user_id:", req.user_id);
      }
    } else if (req.role === "admin" || req.role === "owner") {
       // If owner/admin, maybe use their name?
       // For now, let's leave it as null or "Owner"
       // response.cashier_name = "Owner"; 
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching business details:", error);
    res.status(500).json({ 
      message: "Failed to fetch business details",
      error: error.message 
    });
  }
};

module.exports = {
  getBusinessDetails,
};
