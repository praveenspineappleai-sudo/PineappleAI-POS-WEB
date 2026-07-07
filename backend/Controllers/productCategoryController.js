// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const { ProductCategory, Product, Category } = require("../models"); // Import necessary models

// Get all ProductCategories
const getAllProductCategories = async (req, res) => {
  try {
    const productCategories = await ProductCategory.findAll({
      include: [
        { model: Product, as: "product" }, // Include related Product data
        { model: Category, as: "category" }, // Include related Category data
      ],
    });
    res.status(200).json(productCategories); // Respond with fetched data
  } catch (error) {
    console.error(error); // Log errors for debugging
    res.status(500).json({ error: "Failed to fetch ProductCategories", details: error.message }); // Return error response
  }
};

// Create a ProductCategory
const createProductCategory = async (req, res) => {
  const { product_id, category_id } = req.body; // Extract product and category IDs from request body
  try {
    const newProductCategory = await ProductCategory.create({ product_id, category_id }); // Create new ProductCategory entry
    res.status(201).json(newProductCategory); // Respond with the newly created entry
  } catch (error) {
    console.error(error); // Log errors for debugging
    res.status(500).json({ error: "Failed to create ProductCategory", details: error.message }); // Return error response
  }
};

module.exports = { getAllProductCategories, createProductCategory }; // Export functions for use in routes
