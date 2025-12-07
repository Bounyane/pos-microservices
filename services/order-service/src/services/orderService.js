const order = require('../models/order');
const orderItem = require('../models/order_items');
const logger = require('../utils/logger');

class OrderService {
    /**
     * Add a new order directly to database
     */
    async asyncOrder(data) {
        const { managerId, numberOrder, waiterId, statusOrder } = data;

        const category = await order.create({
            managerId,
            numberOrder,
            waiterId,
            statusOrder,
            statusOrder: statusOrder !== undefined ? statusOrder : true
        });

        logger.info(`order created: ${name}`);
        return category;
    }

    /**
     * Add a new orderItem directly to database
     */
    async asyncOrderItem(data) {
        const {
            orderId, productId, quantity
        } = data;

        const product = await orderItem.create({
            orderId, productId, quantity
        });

        logger.info(`orderItemSaved created: ${name}`);
        return product;
    }
}

module.exports = new OrderService();
