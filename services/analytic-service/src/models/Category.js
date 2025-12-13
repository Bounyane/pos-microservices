const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    managerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    activated: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('Category', categorySchema);
