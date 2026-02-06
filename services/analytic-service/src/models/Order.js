const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    managerId: {
        type: String,
        required: true
    },
    waiterId: {
        type: String,
        required: true
    },
    statusOrder: {
        type: String,
        enum: ['pending', 'payed', 'refused'],
        required: true,
        default: 'pending'
    },
    products: [{
        productId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('Order', OrderSchema);
