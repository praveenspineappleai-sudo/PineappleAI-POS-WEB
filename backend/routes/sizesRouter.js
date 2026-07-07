// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const express = require("express"); // Import Express framework
const router = express.Router(); // Create a new Express router instance
const sizeController = require("../Controllers/sizeController"); // Import the size controller

// Define size-related routes

// POST request to create a new size
router.post("/", sizeController.createSize);

// GET request to retrieve all sizes
router.get("/", sizeController.getSizes);

// GET request to retrieve a specific size by ID
router.get("/:id", sizeController.getSizeById);

// PUT request to update an existing size by ID
router.put("/:id", sizeController.updateSize);

// DELETE request to delete a size by ID
router.delete("/:id", sizeController.deleteSize);

module.exports = router; // Export the router for use in other parts of the application
