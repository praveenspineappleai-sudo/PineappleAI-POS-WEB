// // controllers/shopController.js
// const { AccessKey, BusinessDetail, OwnerDetail, User } = require("../models");

// const getShopsData = async (req, res) => {
//   try {
//     const { limit } = req.query;

//     const accessKeys = await AccessKey.findAll({
//       include: [
//         {
//           model: BusinessDetail,
//           as: "business",
//           include: [
//             {
//               model: OwnerDetail,
//               as: "owner",
//               include: [
//                 {
//                   model: User,
//                   as: "user",
//                   attributes: [
//                     "id",
//                     "email",
//                     "status",
//                     "email_verified_at",
//                     "role",
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//       limit: limit ? parseInt(limit) : undefined,
//     });

//     // Transform data to match React component format
//     const transformedData = accessKeys.map((key) => {
//       const user = key.business?.owner?.user;

//       return {
//         id: key.id.toString().padStart(2, "0"),
//         businessName: key.business?.name || "N/A",
//         keyStatus: mapKeyStatus(key.key_status, key.valid_till),
//         emailStatus: mapEmailStatus(key.email_status),
//         // Map based on email verification and user status
//         ownerApproval: mapOwnerApproval(user?.email_verified_at, user?.status),
//         userStatus: mapUserStatus(user?.status),
//         // Additional data
//         rawData: {
//           accessKeyId: key.id,
//           businessId: key.business?.id,
//           ownerId: key.business?.owner?.id,
//           userId: user?.id,
//           email: user?.email,
//           ownerName: key.business?.owner?.name,
//           ownerPhone: key.business?.owner?.phone_number,
//           ownerDob: key.business?.owner?.dob || null,
//           ownerGender: key.business?.owner?.gender || null,
//         },
//       };
//     });

//     res.json({
//       success: true,
//       data: transformedData,
//       count: transformedData.length,
//     });
//   } catch (error) {
//     console.error("Error fetching shops data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching shops data",
//       error: error.message,
//     });
//   }
// };

// // Helper functions
// const mapKeyStatus = (status, validTill) => {
//   // Check if key is expired
//   if (status === "expired" || (validTill && new Date(validTill) < new Date())) {
//     return "Expire";
//   }
//   // If active or inactive, show as Generated
//   if (status === "active" || status === "inactive") {
//     return "Generated";
//   }
//   return "Generated";
// };

// const mapEmailStatus = (status) => {
//   const statusMap = {
//     sent: "Send",
//     pending: "Not send",
//     failed: "Failed",
//   };
//   return statusMap[status] || "Not send";
// };

// // Map owner approval based on email verification
// const mapOwnerApproval = (emailVerifiedAt, userStatus) => {
//   // If email is verified, consider as accepted
//   if (emailVerifiedAt) {
//     return "Accepted";
//   }
//   // If user is suspended or has other negative status
//   if (userStatus === "suspended" || userStatus === "banned") {
//     return "Rejected";
//   }
//   // Otherwise, still pending
//   return "Not accepted";
// };

// const mapUserStatus = (status) => {
//   const statusMap = {
//     active: "Active",
//     disabled: "Disabled",
//     inactive: "Disabled",
//     suspended: "Suspended",
//     banned: "Suspended",
//   };
//   return statusMap[status] || "Disabled";
// };

// // Get single shop details
// const getShopById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const accessKey = await AccessKey.findByPk(id, {
//       include: [
//         {
//           model: BusinessDetail,
//           as: "business",
//           include: [
//             {
//               model: OwnerDetail,
//               as: "owner",
//               include: [
//                 {
//                   model: User,
//                   as: "user",
//                   attributes: [
//                     "id",
//                     "email",
//                     "username",
//                     "status",
//                     "email_verified_at",
//                     "role",
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     });

//     if (!accessKey) {
//       return res.status(404).json({
//         success: false,
//         message: "Shop not found",
//       });
//     }

//     const user = accessKey.business?.owner?.user;

//     const shopData = {
//       id: accessKey.id.toString().padStart(2, "0"),
//       businessName: accessKey.business?.name || "N/A",
//       businessAddress: accessKey.business?.address || "N/A",
//       businessStatus: accessKey.business?.status,

//       // Access Key Details
//       keyStatus: mapKeyStatus(accessKey.key_status, accessKey.valid_till),
//       keyValue: accessKey.key_value,
//       validTill: accessKey.valid_till,

//       // Email Status
//       emailStatus: mapEmailStatus(accessKey.email_status),

//       // Owner/User Details
//       ownerApproval: mapOwnerApproval(user?.email_verified_at, user?.status),
//       userStatus: mapUserStatus(user?.status),
//       ownerName: accessKey.business?.owner?.name,
//       ownerPhone: accessKey.business?.owner?.phone_number,
//       ownerDob: accessKey.business?.owner?.dob,
//       ownerGender: accessKey.business?.owner?.gender,
//       ownerEmail: user?.email,
//       ownerUsername: user?.username,
//       emailVerified: !!user?.email_verified_at,
//       emailVerifiedAt: user?.email_verified_at,

//       // Timestamps
//       createdAt: accessKey.created_at,
//       updatedAt: accessKey.updated_at,
//     };

//     res.json({
//       success: true,
//       data: shopData,
//     });
//   } catch (error) {
//     console.error("Error fetching shop details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching shop details",
//       error: error.message,
//     });
//   }
// };

// // Update approval status (if you add approval_status column later)
// const updateApprovalStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { approval_status } = req.body;

//     if (!["accepted", "rejected", "pending"].includes(approval_status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid approval status",
//       });
//     }

//     const accessKey = await AccessKey.findByPk(id, {
//       include: [
//         {
//           model: BusinessDetail,
//           as: "business",
//           include: [
//             {
//               model: OwnerDetail,
//               as: "owner",
//               include: [{ model: User, as: "user" }],
//             },
//           ],
//         },
//       ],
//     });

//     if (!accessKey || !accessKey.business?.owner?.user) {
//       return res.status(404).json({
//         success: false,
//         message: "Shop or user not found",
//       });
//     }

//     // Update user's approval status (if column exists)
//     await accessKey.business.owner.user.update({
//       approval_status,
//       // Auto-activate user if approved
//       status: approval_status === "accepted" ? "active" : "disabled",
//     });

//     res.json({
//       success: true,
//       message: "Approval status updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating approval status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating approval status",
//       error: error.message,
//     });
//   }
// };

// // Update user status
// const updateUserStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!["active", "disabled", "suspended"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user status",
//       });
//     }

//     const accessKey = await AccessKey.findByPk(id, {
//       include: [
//         {
//           model: BusinessDetail,
//           as: "business",
//           include: [
//             {
//               model: OwnerDetail,
//               as: "owner",
//               include: [{ model: User, as: "user" }],
//             },
//           ],
//         },
//       ],
//     });

//     if (!accessKey || !accessKey.business?.owner?.user) {
//       return res.status(404).json({
//         success: false,
//         message: "Shop or user not found",
//       });
//     }

//     await accessKey.business.owner.user.update({ status });

//     res.json({
//       success: true,
//       message: "User status updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating user status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating user status",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   getShopsData,
//   getShopById,
//   updateApprovalStatus,
//   updateUserStatus,
// };


// controllers/shopController.js
const { BusinessDetail, AccessKey, OwnerDetail, User } = require("../models");

// Helper functions
const mapKeyStatus = (status, validTill) => {
  if (status === "expired" || (validTill && new Date(validTill) < new Date())) {
    return "Expired";
  }
  if (status === "active" || status === "inactive") {
    return "Generated";
  }
  return "Generated";
};

const mapEmailStatus = (status) => {
  const statusMap = { sent: "Sent", pending: "Not sent", failed: "Failed" };
  return statusMap[status] || "Not sent";
};

const mapOwnerApproval = (emailVerifiedAt, userStatus) => {
  if (emailVerifiedAt) return "Accepted";
  if (["suspended", "banned"].includes(userStatus)) return "Rejected";
  return "Not accepted";
};

const mapUserStatus = (status) => {
  const statusMap = {
    active: "Active",
    disabled: "Disabled",
    inactive: "Disabled",
    suspended: "Suspended",
    banned: "Suspended",
  };
  return statusMap[status] || "Disabled";
};

// GET all shops based on BusinessDetail
const getShopsData = async (req, res) => {
  try {
    const { limit } = req.query;

    const businesses = await BusinessDetail.findAll({
      include: [
        {
          model: AccessKey,
          as: "accessKeys",
          limit: 1,
          order: [["created_at", "DESC"]],
        },
        {
          model: OwnerDetail,
          as: "owner",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email", "status", "email_verified_at", "role"],
            },
          ],
        },
      ],
      limit: limit ? parseInt(limit) : undefined,
      order: [["created_at", "DESC"]],
    });

    const transformedData = businesses.map((b) => {
      const key = b.accessKeys?.[0] || null;
      const user = b.owner?.user;

      return {
        id: b.id.toString().padStart(2, "0"),
        businessName: b.name || "N/A",
        keyStatus: key ? mapKeyStatus(key.key_status, key.valid_till) : "No Key",
        emailStatus: key ? mapEmailStatus(key.email_status) : "Not sent",
        ownerApproval: mapOwnerApproval(user?.email_verified_at, user?.status),
        userStatus: mapUserStatus(user?.status),

        rawData: {
          businessId: b.id,
          accessKeyId: key?.id || null,
          ownerId: b.owner?.id,
          userId: user?.id,
          email: user?.email,
          ownerName: b.owner?.name,
          ownerPhone: b.owner?.phone_number,
          ownerDob: b.owner?.dob,
          ownerGender: b.owner?.gender,
        },
      };
    });

    res.json({ success: true, data: transformedData, count: transformedData.length });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: "Error fetching shops", error: error.message });
  }
};

// GET single shop by BusinessDetail
const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await BusinessDetail.findByPk(id, {
      include: [
        {
          model: AccessKey,
          as: "accessKeys",
          limit: 1,
          order: [["created_at", "DESC"]],
        },
        {
          model: OwnerDetail,
          as: "owner",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email", "username", "status", "email_verified_at", "role"],
            },
          ],
        },
      ],
    });

    if (!business) return res.status(404).json({ success: false, message: "Shop not found" });

    const key = business.accessKeys?.[0] || null;
    const user = business.owner?.user;

    const shopData = {
      businessId: business.id,
      businessName: business.name,
      businessAddress: business.address,
      businessStatus: business.status,

      keyStatus: key ? mapKeyStatus(key.key_status, key.valid_till) : "No Key",
      keyValue: key?.key_value,
      validTill: key?.valid_till,
      emailStatus: key ? mapEmailStatus(key.email_status) : "Not sent",

      ownerName: business.owner?.name,
      ownerPhone: business.owner?.phone_number,
      ownerDob: business.owner?.dob,
      ownerGender: business.owner?.gender,

      ownerEmail: user?.email,
      ownerUsername: user?.username,
      emailVerified: !!user?.email_verified_at,

      createdAt: business.created_at,
      updatedAt: business.updated_at,
    };

    res.json({ success: true, data: shopData });
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ success: false, message: "Error fetching shop", error: error.message });
  }
};

// UPDATE user approval based on businessId
const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params; // businessId
    const { approval_status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(approval_status))
      return res.status(400).json({ success: false, message: "Invalid approval status" });

    const business = await BusinessDetail.findByPk(id, {
      include: [{ model: OwnerDetail, as: "owner", include: [{ model: User, as: "user" }] }],
    });

    if (!business || !business.owner?.user)
      return res.status(404).json({ success: false, message: "Shop or user not found" });

    await business.owner.user.update({
      approval_status,
      status: approval_status === "accepted" ? "active" : "disabled",
    });

    res.json({ success: true, message: "Approval status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating approval status", error: error.message });
  }
};

// UPDATE user status based on businessId
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // businessId
    const { status } = req.body;

    if (!["active", "disabled", "suspended"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid user status" });

    const business = await BusinessDetail.findByPk(id, {
      include: [{ model: OwnerDetail, as: "owner", include: [{ model: User, as: "user" }] }],
    });

    if (!business || !business.owner?.user)
      return res.status(404).json({ success: false, message: "Shop or user not found" });

    await business.owner.user.update({ status });

    res.json({ success: true, message: "User status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user status", error: error.message });
  }
};

module.exports = {
  getShopsData,
  getShopById,
  updateApprovalStatus,
  updateUserStatus,
};
