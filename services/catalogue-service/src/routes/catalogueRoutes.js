const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');

// Add category (POST) - Direct insert
router.post('/syncProduct', catalogueController.syncProduct);

// Add product (POST) - Direct insert
router.post('/syncCategories', catalogueController.syncCategories);

module.exports = router;
