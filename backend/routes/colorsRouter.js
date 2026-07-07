//Developed by M.Vaishnavi start 01/4 end 02/4

const express = require("express");
const router = express.Router();
const colorController = require("../Controllers/colorController"); // Import the controller

// Define color-related routes
router.post("/", colorController.createColor); // Create a new color
router.get("/colors", colorController.getColors); // Retrieve all colors
router.get("/:id", colorController.getColorById); // Retrieve a color by ID
router.patch("/:id", colorController.updateColor); // Update a color by ID
router.delete("/:id", colorController.deleteColor); // Delete a color by ID

module.exports = router; // Export the router
