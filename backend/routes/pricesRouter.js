//Developed by M.Vaishnavi start 01/4 end 02/4

const express = require("express");
const router = express.Router();
const { createPrice, getAllPrices } = require("../Controllers/priceController");

// Route to create a new price entry
router.post("/", createPrice);

// Route to get all price entries
router.get("/getallprices", getAllPrices);

module.exports = router;
