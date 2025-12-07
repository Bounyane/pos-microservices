const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        logger.error(`URI: ${process.env.MONGODB_URI ? 'Defined' : 'Undefined'}`); // Don't log the full URI for security
        process.exit(1);
    }
};

module.exports = connectDB;
