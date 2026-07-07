// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const express = require("express"); // Import Express framework
const router = express.Router(); // Create an Express router instance
const { createBarcode, getBarcodes, deleteBarcode, getBarcodeById } = require("../Controllers/barcodeController"); // Import barcode controller functions

router.post("/", createBarcode); // Define POST route to create a barcode
router.get("/", getBarcodes); // Define GET route to fetch all barcodes
router.delete("/barcodes/:id", deleteBarcode); // Define DELETE route to remove a barcode by ID
// In your routes file
router.get('/barcodes/:id', getBarcodeById);
module.exports = router; // Export the router to use in other parts of the application
