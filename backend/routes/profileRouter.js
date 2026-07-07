const express = require('express');
const router = express.Router();
const { getProfile } = require('../Controllers/profileController');

// ✅ GET business + owner profile details
// Example: GET /api/profile?business_id=1
router.get('/', getProfile);

module.exports = router;
