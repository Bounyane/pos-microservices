const amqp = require('amqplib');
const logger = require('../utils/logger');
const walletService = require('./walletService');

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
            logger.error(`RabbitMQ connection error: ${error.message}`);
            setTimeout(() => this.connect(), 5000);
        }
    }

    async setupConsumers() {
        // User Events - for wallet creation
        const userExchange = 'user_events';
        const userQueue = 'wallet_user_queue';

        await this.channel.assertExchange(userExchange, 'topic', { durable: true });
        await this.channel.assertQueue(userQueue, { durable: true });
        await this.channel.bindQueue(userQueue, userExchange, 'user.registered');

        this.channel.consume(userQueue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    logger.info(`Received message: ${routingKey}`);

                    await this.handleUserEvent(routingKey, content);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                    this.channel.nack(msg, false, false);
                }
            }
        });

        // Transaction Events - for wallet updates
        const transactionExchange = 'transaction_events';
        const transactionQueue = 'wallet_transaction_queue';

        await this.channel.assertExchange(transactionExchange, 'topic', { durable: true });
        await this.channel.assertQueue(transactionQueue, { durable: true });
        await this.channel.bindQueue(transactionQueue, transactionExchange, 'transaction.created');

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

    async handleUserEvent(routingKey, data) {
        switch (routingKey) {
            case 'user.registered':
                await walletService.createWallet(data.userId || data._id);
                logger.info(`Wallet created for new user: ${data.userId || data._id}`);
                break;
            default:
                logger.warn(`Unknown routing key: ${routingKey}`);
        }
    }

    async handleTransactionEvent(routingKey, data) {
        switch (routingKey) {
            case 'transaction.created':
                await walletService.updateWalletBalance(data.customerId, data.cashback);
                logger.info(`Wallet updated for customer: ${data.customerId}, cashback: ${data.cashback}`);
                break;
            default:
                logger.warn(`Unknown routing key: ${routingKey}`);
        }
    }
}

module.exports = new MessageBroker();
