const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/productSearchController");
const { authMiddleware } = require("../middlewares/authMiddleware"); // add this

// Protect routes with authMiddleware
router.get("/products", authMiddleware, ProductController.getProducts);
router.delete("/products/:id", authMiddleware, ProductController.deleteProduct);

module.exports = router;
