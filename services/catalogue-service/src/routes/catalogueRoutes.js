const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');

// Add category (POST) - Direct insert
router.post('/asyncProduct', catalogueController.asyncProduct);

// Add product (POST) - Direct insert
router.post('/asyncCategories', catalogueController.asyncCategories);

module.exports = router;
