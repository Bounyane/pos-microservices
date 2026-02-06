const Order = require('../models/order');
const logger = require('../utils/logger');

class OrderService {
    /**
     * Add a new order directly to database
     */
    async asyncOrder(data) {
        const { managerId, waiterId, statusOrder, products } = data;

        const order = await Order.create({
            managerId,
            waiterId,
            statusOrder: statusOrder || 'pending',
            products: products || []
        });

        logger.info(`order created: ${order._id}`);
        return order;
    }

    /**
     * Update an existing order
     */
    async updateOrder(data) {
        const { orderId, waiterId, statusOrder, products } = data;

        const updateData = {};
        if (waiterId) updateData.waiterId = waiterId;
        if (statusOrder) updateData.statusOrder = statusOrder;
        if (products) updateData.products = products;

        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!order) {
            throw new Error('Order not found');
        }

        logger.info(`order updated: ${order._id}`);
        return order;
    }
}

module.exports = new OrderService();
