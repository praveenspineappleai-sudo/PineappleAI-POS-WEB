// routes/shopRoutes.js
const express = require("express");
const router = express.Router();
const {
  getShopsData,
  getShopById,
  updateApprovalStatus,
  updateUserStatus,
} = require("../Controllers/shopController");

// Get all shops (with optional limit)
router.get("/shops", getShopsData);

// Get single shop by ID
router.get("/shops/:id", getShopById);

// Update approval status
router.patch("/shops/:id/approval", updateApprovalStatus);

// Update user status
router.patch("/shops/:id/status", updateUserStatus);

module.exports = router;
