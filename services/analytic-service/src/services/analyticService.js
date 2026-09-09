const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

class AnalyticService {
    /**
     * Get all analytics data for a manager in one call
     */
    async getAnalytics(managerId) {
        try {
            // Run all queries in parallel
            const [
                orders,
                ordersByStatus,
                productSales,
                ordersByWaiter
            ] = await Promise.all([
                // All orders
                Order.find({ managerId }).sort({ created_at: -1 }).lean(),

                // Status breakdown
                Order.aggregate([
                    { $match: { managerId } },
                    { $group: { _id: '$statusOrder', count: { $sum: 1 } } }
                ]),

                // Product sales
                Order.aggregate([
                    { $match: { managerId } },
                    { $unwind: '$products' },
                    {
                        $group: {
                            _id: '$products.productId',
                            totalQuantity: { $sum: '$products.quantity' },
                            orderCount: { $sum: 1 }
                        }
                    },
                    { $sort: { totalQuantity: -1 } }
                ]),

                // Orders per waiter
                Order.aggregate([
                    { $match: { managerId } },
                    {
                        $group: {
                            _id: '$waiterId',
                            totalOrders: { $sum: 1 },
                            pending: { $sum: { $cond: [{ $eq: ['$statusOrder', 'pending'] }, 1, 0] } },
                            payed: { $sum: { $cond: [{ $eq: ['$statusOrder', 'payed'] }, 1, 0] } },
                            refused: { $sum: { $cond: [{ $eq: ['$statusOrder', 'refused'] }, 1, 0] } }
                        }
                    },
                    { $sort: { totalOrders: -1 } }
                ])
            ]);

            // Enrich product sales with names
            const productIds = productSales.map(r => r._id);
            const products = await Product.find({ _id: { $in: productIds } }).lean();
            const productMap = {};
            products.forEach(p => { productMap[p._id.toString()] = p; });

            // Enrich orders with product details
            const enrichedOrders = orders.map(order => {
                const orderProducts = order.products.map(p => ({
                    productId: p.productId,
                    productName: productMap[p.productId]?.name || 'Unknown',
                    price: productMap[p.productId]?.price || 0,
                    quantity: p.quantity,
                    subtotal: (productMap[p.productId]?.price || 0) * p.quantity
                }));

                const totalAmount = orderProducts.reduce((sum, p) => sum + p.subtotal, 0);

                return {
                    _id: order._id,
                    waiterId: order.waiterId,
                    statusOrder: order.statusOrder,
                    products: orderProducts,
                    totalAmount,
                    createdAt: order.created_at
                };
            });

            // Build status breakdown
            const totalOrders = orders.length;
            const statusBreakdown = ordersByStatus.map(s => ({
                status: s._id,
                count: s.count,
                percentage: totalOrders > 0 ? parseFloat(((s.count / totalOrders) * 100).toFixed(1)) : 0
            }));

            // Build product sales
            const sales = productSales.map(r => ({
                productId: r._id,
                productName: productMap[r._id]?.name || 'Unknown',
                price: productMap[r._id]?.price || 0,
                totalQuantity: r.totalQuantity,
                orderCount: r.orderCount
            }));

            // Build waiter stats
            const waiters = ordersByWaiter.map(r => ({
                waiterId: r._id,
                totalOrders: r.totalOrders,
                pending: r.pending,
                payed: r.payed,
                refused: r.refused
            }));

            return {
                totalOrders,
                statusBreakdown,
                orders: enrichedOrders,
                productSales: sales,
                ordersByWaiter: waiters
            };
        } catch (error) {
            logger.error(`Error getting analytics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AnalyticService();
