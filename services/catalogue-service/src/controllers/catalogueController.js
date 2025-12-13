const catalogueService = require('../services/CatalogueService');
const logger = require('../utils/logger');
const messageBroker = require('../services/MessageBroker');

/**
 * Add Category - Direct insert to database
 */
exports.asyncProduct = async (req, res) => {
    try {
        const { managerId, name } = req.body;

        if (!managerId || !name) {
            return res.status(400).json({
                success: false,
                message: 'ManagerId and Name are required'
            });
        }

        const product = await catalogueService.asyncProducts(req.body);
        await messageBroker.publishEvent('catalogue_events', 'product.created', product);
        res.status(201).json({ success: true, data: product });
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
exports.asyncCategories = async (req, res) => {
    try {
        const { managerId, name } = req.body;

        if (!managerId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: managerId, categoryId, name, price'
            });
        }

        const category = await catalogueService.asyncCategories(req.body);
        await messageBroker.publishEvent('catalogue_events', 'category.created', category);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        logger.error(`Error adding product: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
