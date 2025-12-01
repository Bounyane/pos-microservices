const catalogueService = require('../services/CatalogueService');
const logger = require('../utils/logger');

/**
 * Add Category - Direct insert to database
 */
exports.syncProduct = async (req, res) => {
    try {
        const { managerId, name } = req.body;

        if (!managerId || !name) {
            return res.status(400).json({
                success: false,
                message: 'ManagerId and Name are required'
            });
        }

        const category = await catalogueService.syncProducts(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        logger.error(`Error adding category: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Add Product - Direct insert to database
 */
exports.syncCategories = async (req, res) => {
    try {
        const { managerId, name } = req.body;

        if (!managerId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: managerId, categoryId, name, price'
            });
        }

        const product = await catalogueService.syncCategories(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        logger.error(`Error adding product: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
