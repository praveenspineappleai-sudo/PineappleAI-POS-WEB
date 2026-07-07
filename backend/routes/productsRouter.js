// // Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

// const express = require('express');
// const router = express.Router();
// const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addProduct,addProductAttributes } = require('../Controllers/productController');

// // Get all products
// router.get('/', getAllProducts);

// // Get a product by ID
// router.get('/:id', getProductById);

// // // Create a product
// // router.post('/create', createProduct);

// // Add a product with barcode generation
// //router.post("/add-product", addProduct);

// // Update a product by ID
// router.put('/update/:id', updateProduct);

// // Delete a product by ID
// router.delete('/delete/:id', deleteProduct);

// // Create a new product
// router.post("/add-product", createProduct);

// // Add attributes (color, size, price) for an existing product
// router.post("/add-attributes", addProductAttributes);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getBarcodeImage,
  updateProduct,
  deleteProduct,
  addProduct,
  addProductAttributes,
  createProduct,
  addPricing,
  editPrice,
  deletePrice,
  getPrice,
  updateProductWithPrice,
} = require("../Controllers/productController"); // ✅ Ensure correct import path

// // Get all products
// router.get("/", getAllProducts);

// // Get a product by ID
// router.get("/:id", getProductById);

// // Add a product with barcode generation
// router.post("/add-product", createProduct); // ✅ Use only one function for product creation

// //router.post("/add-pricing", addPricing); // ✅ Use only one function for pricing and barcode generation

// // Update a product by ID
// router.put("/update/:id", updateProduct);

// // Delete a product by ID
// router.delete("/delete/:id", deleteProduct);

// // Add attributes (color, size, price) for an existing product
// router.post("/add-attributes", addProductAttributes);

// Product Routes
router.post("/add-product", addProduct); // ✅ Create product
router.put("/update-product/:id", updateProduct); // ✅ Update product
router.delete("/delete-product/:id", deleteProduct); // ✅ Delete product
router.get("/get-product/:id", getProductById); // ✅ Get product details
router.get("/barcode/image/:barcodeId", getBarcodeImage);
router.put(
  "/update-product-with-price/:productId/:priceId",
  updateProductWithPrice
); // ✅ NEW: Update both together

// Pricing Routes
router.post("/add-pricing", addPricing); // ✅ Add pricing & barcode
router.put("/edit-price/:id", editPrice); // ✅ Update price details
router.delete("/delete-price/:id", deletePrice); // ✅ Delete price entry
router.get("/get-price/:id", getPrice); // ✅ Get price details

module.exports = router;
