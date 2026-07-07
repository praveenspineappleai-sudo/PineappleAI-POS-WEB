const express = require("express");
const router = express.Router();
const salesController = require("../Controllers/salesController");

// Route to fetch sales statistics based on daily, weekly, or monthly period
router.get("/stats", salesController.getSalesStats);

router.get("/csv", salesController.downloadSalesStatsCSV);

module.exports = router;
