const orderService = require('../services/orderService');
const logger = require('../utils/logger');
const messageBroker = require('../services/MessageBroker');

/**
 * Add order - Direct insert to database
 */
exports.asyncOrder = async (req, res) => {
    try {
        const { managerId, waiterId, statusOrder, products } = req.body;

        if (!managerId || !waiterId || !statusOrder || !products) {
            return res.status(400).json({
                success: false,
                message: 'managerId, waiterId, statusOrder, and products are required'
            });
        }

        // Validate products array
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'products must be a non-empty array'
            });
        }

        const order = await orderService.asyncOrder(req.body);
        await messageBroker.publishEvent('order_events', 'order.created', order);
        res.status(201).json({ success: true, orderId: order._id });
    } catch (error) {
        logger.error(`Error adding order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update order
 */
exports.updateOrder = async (req, res) => {
    try {
        const { orderId, waiterId, statusOrder, products } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        const order = await orderService.updateOrder(req.body);
        await messageBroker.publishEvent('order_events', 'order.updated', order);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        logger.error(`Error updating order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
