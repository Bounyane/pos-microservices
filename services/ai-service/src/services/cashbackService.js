const logger = require('../utils/logger');

/**
 * Get random cashback value
 * @param {Object} call - gRPC call object
 * @param {Function} callback - gRPC callback
 */
function getCashback(call, callback) {
    const { orderId, customerId } = call.request;

    logger.info(`Calculating cashback for order: ${orderId}, customer: ${customerId}`);

    // Generate random cashback between 0 and 100
    const cashback = Math.random() * 100;

    logger.info(`Generated cashback: ${cashback.toFixed(2)} for order ${orderId}`);

    callback(null, { cashback: parseFloat(cashback.toFixed(2)) });
}

module.exports = {
    getCashback
};
