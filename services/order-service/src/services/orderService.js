const Order = require('../models/order');
const OrderItem = require('../models/order_items');
const logger = require('../utils/logger');

class OrderService {
    /**
     * Add a new order directly to database
     */
    async asyncOrder(data) {
        const { managerId, numberOrder, waiterId, statusOrder } = data;

        const order = await Order.create({
            managerId,
            numberOrder,
            waiterId,
            statusOrder: statusOrder !== undefined ? statusOrder : true
        });

        logger.info(`order created: ${order._id}`);
        return order;
    }

    /**
     * Add a new orderItem directly to database
     */
    async asyncOrderItem(data) {
        const {
            orderId, productId, quantity
        } = data;

        const order = await OrderItem.create({
            orderId, productId, quantity
        });

        logger.info(`orderItemSaved created: ${order._id}`);
        return order;
    }
}

module.exports = new OrderService();
