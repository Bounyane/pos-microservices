const logger = require('../utils/logger');
const Transaction = require('../models/Transaction');
const aiServiceClient = require('./aiServiceClient');
const messageBroker = require('./MessageBroker');
const blockchainService = require('./blockchainService');

class TransactionService {
    async createTransaction(orderId, customerId) {
        try {
            logger.info(`Processing transaction for order: ${orderId}`);

            // Call AI service via gRPC to get cashback
            const cashback = await aiServiceClient.getCashback(orderId, customerId);

            const timestamp = new Date();

            // Store hash on Polygon blockchain
            let blockchainTx = null;
            try {
                blockchainTx = await blockchainService.storeOnChain(
                    orderId, customerId, cashback, timestamp.toISOString()
                );
            } catch (error) {
                logger.error(`Blockchain storage failed (non-blocking): ${error.message}`);
            }

            // Prepare transaction data
            const transactionData = {
                orderId,
                customerId,
                cashback,
                blockchainTx,
                timestamp
            };

            // Save transaction to database
            const transaction = new Transaction(transactionData);
            const savedTransaction = await transaction.save();
            logger.info(`Transaction saved to database: ${savedTransaction._id}`);

            // Publish transaction event to RabbitMQ
            await messageBroker.publishEvent('transaction_events', 'transaction.created', {
                orderId,
                customerId,
                cashback,
                timestamp
            });

            return savedTransaction;
        } catch (error) {
            logger.error(`Error creating transaction: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new TransactionService();

