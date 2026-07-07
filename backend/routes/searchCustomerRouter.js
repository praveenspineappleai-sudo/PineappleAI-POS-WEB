// developed by G.Sabisan start 4/3/2025 to 5/3/2025

const express = require("express");
const router = express.Router();
const CustomerController = require("../Controllers/customerSearchController");

// Route to search for customers by name, phone number, or email
router.get("/customers/search", CustomerController.searchCustomers);

module.exports = router;
