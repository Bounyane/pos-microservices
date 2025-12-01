const express = require('express');
const router = express.Router();
const ManagerController = require('../controllers/managerController');
const { 
  validateManager, 
} = require('../middleware/validation');


// Manager profile routes
router.get('/',ManagerController.getManagers)
router.post('/create', validateManager, ManagerController.createManagerProfile);
router.get('/:id', ManagerController.getManagerProfile);
router.post('/update', ManagerController.updateManagerProfile);


module.exports = router; 