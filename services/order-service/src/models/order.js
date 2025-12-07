const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    managerId: {
        type: String,
        required: true
    },
    numberOrder: {
        type: String,
        required: true

    },
    waiterId: {
        type: String,
        required: true
    },
    statusOrder: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('Order', OrderSchema);
