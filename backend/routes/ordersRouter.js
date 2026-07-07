const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController"); // Ensure correct path

// ✅ Route to create a new order
router.post("/create-order", orderController.createOrder);

// ✅ Route to fetch bill details using order number
router.get("/bills/:order_no", orderController.getBillByOrderNo);
router.post('/resend-bill/:order_no', orderController.resendBillEmail); // New route
module.exports = router;
