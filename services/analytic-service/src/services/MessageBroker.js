const amqp = require('amqplib');
const logger = require('../utils/logger');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

class MessageBroker {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            logger.info('Connected to RabbitMQ');
            await this.setupConsumers();
        } catch (error) {
            logger.error(`Error connecting to RabbitMQ: ${error.message}`);
            // Retry logic could go here
            setTimeout(() => this.connect(), 5000);
        }
    }

    async setupConsumers() {
        // Catalogue Events
        const catalogueExchange = 'catalogue_events';
        const catalogueQueue = 'analytics_catalogue_queue';

        await this.channel.assertExchange(catalogueExchange, 'topic', { durable: true });
        await this.channel.assertQueue(catalogueQueue, { durable: true });

        // Bind to all catalogue events
        await this.channel.bindQueue(catalogueQueue, catalogueExchange, '#');

        this.channel.consume(catalogueQueue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    logger.info(`Received message: ${routingKey}`);

                    await this.handleCatalogueEvent(routingKey, content);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                    // Depending on error, might want to nack or ack to avoid loop
                    this.channel.nack(msg, false, false);
                }
            }
        });

        // Order Events
        const orderExchange = 'order_events';
        const orderQueue = 'analytics_order_queue';

        await this.channel.assertExchange(orderExchange, 'topic', { durable: true });
        await this.channel.assertQueue(orderQueue, { durable: true });

        // Bind to all order events
        await this.channel.bindQueue(orderQueue, orderExchange, '#');

        this.channel.consume(orderQueue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    logger.info(`Received message: ${routingKey}`);

                    await this.handleOrderEvent(routingKey, content);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                    this.channel.nack(msg, false, false);
                }
            }
        });

        // Transaction Events
        const transactionExchange = 'transaction_events';
        const transactionQueue = 'analytics_transaction_queue';

        await this.channel.assertExchange(transactionExchange, 'topic', { durable: true });
        await this.channel.assertQueue(transactionQueue, { durable: true });

        // Bind to all transaction events
        await this.channel.bindQueue(transactionQueue, transactionExchange, '#');

        this.channel.consume(transactionQueue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    logger.info(`Received message: ${routingKey}`);

                    await this.handleTransactionEvent(routingKey, content);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                    this.channel.nack(msg, false, false);
                }
            }
        });
    }

    async handleCatalogueEvent(routingKey, data) {
        switch (routingKey) {
            case 'product.created':
            case 'product.updated': // Assuming similar structure for update
                await Product.findOneAndUpdate(
                    { _id: data._id },
                    data,
                    { upsert: true, new: true }
                );
                logger.info(`Processed Product: ${data._id}`);
                break;
            case 'category.created':
            case 'category.updated':
                await Category.findOneAndUpdate(
                    { _id: data._id },
                    data,
                    { upsert: true, new: true }
                );
                logger.info(`Processed Category: ${data._id}`);
                break;
            default:
                logger.warn(`Unknown routing key: ${routingKey}`);
        }
    }

    async handleOrderEvent(routingKey, data) {
        switch (routingKey) {
            case 'order.created':
            case 'order.updated':
                await Order.findOneAndUpdate(
                    { _id: data._id },
                    data,
                    { upsert: true, new: true }
                );
                logger.info(`Processed Order: ${data._id}`);
                break;
            default:
                logger.warn(`Unknown routing key: ${routingKey}`);
        }
    }

    async handleTransactionEvent(routingKey, data) {
        switch (routingKey) {
            case 'transaction.created':
                const transaction = new Transaction({
                    orderId: data.orderId,
                    customerId: data.customerId,
                    cashback: data.cashback,
                    timestamp: data.timestamp
                });
                await transaction.save();
                logger.info(`Processed Transaction for order: ${data.orderId}`);
                break;
            default:
                logger.warn(`Unknown routing key: ${routingKey}`);
        }
    }
}

module.exports = new MessageBroker();
