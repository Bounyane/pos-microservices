const express = require('express');
const router = express.Router();
const DealerController = require('../controllers/DealerController');
const {
  validateDealer
} = require('../middleware/validation');



// Dealer profile routes
router.get('/', DealerController.getDealers)
router.post('/create', validateDealer, DealerController.createDealerProfile);
router.get('/:id', DealerController.getDealerProfile);
router.post('/update', DealerController.updateDealerProfile);

module.exports = router; 