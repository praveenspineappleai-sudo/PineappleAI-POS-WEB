// routes/businessDetailsRouter.js
const express = require("express");
const router = express.Router();
const businessDetailsController = require("../Controllers/businessDetailsController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Get business details by business name
// GET /api/business-details?business_name=YourBusinessName
router.get(
  "/",
  authMiddleware,
  businessDetailsController.getBusinessDetails
);

module.exports = router;
