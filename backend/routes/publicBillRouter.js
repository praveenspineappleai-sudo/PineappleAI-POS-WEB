const express = require('express');
const router = express.Router();
const publicBillController = require('../Controllers/publicBillController');

// Route to view bill PDF
router.get('/bills/:order_no', publicBillController.viewBill);

module.exports = router;
