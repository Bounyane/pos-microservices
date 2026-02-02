const logger = require('../utils/logger');
const Transaction = require('../models/Transaction');
const aiServiceClient = require('./aiServiceClient');
const messageBroker = require('./MessageBroker');

class TransactionService {
    async createTransaction(orderId, customerId) {
        try {
            logger.info(`Processing transaction for order: ${orderId}`);

            // Call AI service via gRPC to get cashback
            const cashback = await aiServiceClient.getCashback(orderId, customerId);

            // Prepare transaction data
            const transactionData = {
                orderId,
                customerId,
                cashback,
                timestamp: new Date()
            };

            // Save transaction to database
            const transaction = new Transaction(transactionData);
            const savedTransaction = await transaction.save();
            logger.info(`Transaction saved to database: ${savedTransaction._id}`);

            // Publish transaction event to RabbitMQ for analytics
            await messageBroker.publishEvent('transaction_events', 'transaction.created', transactionData);

            return savedTransaction;
        } catch (error) {
            logger.error(`Error creating transaction: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new TransactionService();
