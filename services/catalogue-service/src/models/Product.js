const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    managerId: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
        required: true

    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tvaPercentage: {
        type: Number,
        default: 0
    },
    tvaPrice: {
        type: Number,
        default: 0
    },
    tvaType: {
        type: String,
        enum: ['inclusive', 'no_tva'],
        default: 'no_tva'
    },
    subtotal: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    },
    activated: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
