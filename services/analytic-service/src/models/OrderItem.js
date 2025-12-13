const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
