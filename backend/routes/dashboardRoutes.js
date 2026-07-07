const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');

// GET dashboard statistics
// Query params: business_name (required)
// Example: /api/dashboard/stats?business_name=MyBusiness
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;