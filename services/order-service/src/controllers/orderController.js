const orderService = require('../services/orderService');
const logger = require('../utils/logger');

/**
 * Add order - Direct insert to database
 */
exports.asyncOrder = async (req, res) => {
    try {
        console.log('test test')
        const { managerId, numberOrder, waiterId, statusOrder } = req.body;

        if (!managerId || !numberOrder || !waiterId || !statusOrder) {
            return res.status(400).json({
                success: false,
                message: 'ManagerId and numberOrder , waiterId ,statusOrder are required'
            });
        }

        const category = await orderService.asyncOrder(req.body);
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
 * Add orderItem - Direct insert to database
 */
exports.asyncOrderItem = async (req, res) => {
    try {
        const { orderId, productId, quantity } = req.body;

        if (!orderId || !productId, !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: managerId, categoryId, name, price'
            });
        }

        const product = await orderService.asyncOrderItem(req.body);
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
