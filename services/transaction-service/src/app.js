const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/transaction', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
});

module.exports = app;
