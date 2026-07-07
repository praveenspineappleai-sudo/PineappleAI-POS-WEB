//Developed by M.Vaishnavi start 01/4 end 02/4

//  Import the Express library
const express = require("express");

//  Destructure and import the controller functions for handling product category routes
const { getAllProductCategories, createProductCategory } = require("../Controllers/productCategoryController");

//  Create an instance of the Express Router to define routes
const router = express.Router();

//  Define a GET route to fetch all product categories and associate it with the controller function
router.get("/", getAllProductCategories);

//  Define a POST route to create a new product category and associate it with the controller function
router.post("/", createProductCategory);

//  Export the router so it can be used in other files, like the main server file
module.exports = router;
