const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        index: true
    },
    customerId: {
        type: String,
        required: true,
        index: true
    },
    cashback: {
        type: Number,
        required: true
    },
    blockchainTx: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
