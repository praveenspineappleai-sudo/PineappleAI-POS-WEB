const express = require('express');
const router = express.Router();

/**
 * GET /api/system-info - Get system information for debugging
 * Returns database name and environment info
 */
router.get('/', (req, res) => {
  try {
    const packageJson = require('../package.json');
    
    const systemInfo = {
      dbName: process.env.DB_NAME || 'Not configured',
      dbHost: process.env.DB_HOST || 'Not configured',
      environment: process.env.NODE_ENV || 'development',
      serverPort: process.env.PORT || '5000',
      version: packageJson.version || '1.0.0',
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system information'
    });
  }
});

module.exports = router;
