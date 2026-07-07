// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const express = require("express"); // Import Express framework
const router = express.Router(); // Create an Express router instance
const categoryController = require("../Controllers/categoryController"); // Import category controller functions

// Get all categories
router.get("/", categoryController.getAllCategories); // Define GET route to retrieve all categories

// Get a single category by ID
router.get("/:id", categoryController.getCategoryById); // Define GET route to retrieve a category by its ID

// Create a new category
router.post("/", categoryController.createCategory); // Define POST route to create a new category

// Update an existing category by ID
router.patch("/:id", categoryController.updateCategory); // Define PUT route to update a category by its ID

// Delete a category by ID
router.delete("/:id", categoryController.deleteCategory); // Define DELETE route to remove a category by its ID

module.exports = router; // Export the router to use in other parts of the application
