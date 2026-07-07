// routes/cashier.js (or wherever your routes are defined)
const express = require("express");
const router = express.Router();
const {
  createCashier,
  getCashiers,
  deleteCashier,
  getBusinessDetails,
} = require("../Controllers/cashierController");

// Import authentication middleware if you have it
// const { authenticate } = require('../middleware/auth');

// Business routes
router.get("/business/:business_id", getBusinessDetails);

// Cashier routes
router.post("/create", createCashier);
router.get("/cashiers", getCashiers);
router.delete("/cashier/:cashier_id", deleteCashier);

module.exports = router;
