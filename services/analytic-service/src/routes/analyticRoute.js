const express = require('express');
const router = express.Router();
const analyticController = require('../controllers/analyticController');

// Get all analytics data
router.get('/', analyticController.getAnalytics);

module.exports = router;
