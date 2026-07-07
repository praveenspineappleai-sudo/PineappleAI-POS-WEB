// categoryController.js

// Import the database models
const db = require("../models");

// Access the Category model
const Category = db.Category;

// Function to get all category names
exports.getCategories = async (req, res) => {
  try {
    // Fetch all categories with only necessary fields
    const categories = await Category.findAll({
      attributes: ['id', 'category_name'], // Only select id and category_name
      order: [['category_name', 'ASC']],   // Sort alphabetically by category name
    });

    // If no categories are found, return a 404 response
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    // Format the response to return an array of category objects
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.category_name
    }));

    // Send the response with categories
    res.status(200).json(formattedCategories);

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
