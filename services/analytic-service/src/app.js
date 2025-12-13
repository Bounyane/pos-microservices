const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const messageBroker = require('./services/MessageBroker');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Connect to RabbitMQ
messageBroker.connect();

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'analytic-service' });
});

module.exports = app;
