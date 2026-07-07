const { BusinessDetail, OwnerDetail, User } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    const { business_id } = req.query;

    if (!business_id) {
      return res.status(400).json({ message: "Business ID is required" });
    }

    // 🧩 Fetch business + owner + user info
    const business = await BusinessDetail.findOne({
      where: { id: business_id },
      include: [
        {
          model: OwnerDetail,
          as: "owner", // ✅ must match alias used in association
          include: [
            {
              model: User,
              as: "user", // ✅ must also match alias used in association
              attributes: ["username", "email"],
            },
          ],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const data = {
      business_name: business.name,
      address: business.address,
      username: business.owner?.user?.username || null,
      owner_email: business.owner?.user?.email || null,
      owner_name: business.owner?.name || null,
      phone_number: business.owner?.phone_number || null,
    };

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
