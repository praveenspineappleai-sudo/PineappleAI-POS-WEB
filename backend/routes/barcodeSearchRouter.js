//developed by Janarthan       06/03/2025

const express = require("express");
const router = express.Router();
const { getProductDetails } = require("../Controllers/barcodeSearchController");

// Route to fetch product details using barcode
router.get("/barcodes/search/:barcodeNo", getProductDetails);

module.exports = router;
