// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../Controllers/categorySearchController");

// Get all categories
router.get("/categories", categoryController.getCategories);

module.exports = router;
