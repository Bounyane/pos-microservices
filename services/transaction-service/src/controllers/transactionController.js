const transactionService = require('../services/transactionService');
const logger = require('../utils/logger');

/**
 * Create transaction - Get cashback from AI service and publish to analytics
 */
exports.createTransaction = async (req, res) => {
    try {
        const { orderId, customerId } = req.body;

        // Validate required fields
        if (!orderId || !customerId) {
            return res.status(400).json({
                success: false,
                message: 'orderId and customerId are required'
            });
        }

        // Process transaction (service handles AI call, DB save, and RabbitMQ publishing)
        const transaction = await transactionService.createTransaction(orderId, customerId);

        // Return response with cashback
        res.status(201).json({
            success: true,
            data: {
                orderId: transaction.orderId,
                customerId: transaction.customerId,
                cashback: transaction.cashback,
                message: 'Transaction processed successfully'
            }
        });
    } catch (error) {
        logger.error(`Error creating transaction: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
