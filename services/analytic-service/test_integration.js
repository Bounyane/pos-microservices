require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

async function testIntegration() {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
        const channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');

        // Publish Product Created Event
        const productData = {
            _id: new mongoose.Types.ObjectId(),
            managerId: 'test-manager',
            categoryId: 'test-category',
            name: 'Test Product',
            price: 100,
            quantity: 10
        };

        await channel.assertExchange('catalogue_events', 'topic', { durable: true });
        channel.publish('catalogue_events', 'product.created', Buffer.from(JSON.stringify(productData)));
        console.log('Published product.created event');

        // Publish Order Created Event
        const orderData = {
            _id: new mongoose.Types.ObjectId(),
            managerId: 'test-manager',
            numberOrder: 'ORD-001',
            waiterId: 'test-waiter',
            statusOrder: true
        };

        await channel.assertExchange('order_events', 'topic', { durable: true });
        channel.publish('order_events', 'order.created', Buffer.from(JSON.stringify(orderData)));
        console.log('Published order.created event');

        // Wait for processing
        console.log('Waiting for processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check DB
        const product = await Product.findById(productData._id);
        if (product) {
            console.log('SUCCESS: Product found in Analytics DB');
        } else {
            console.error('FAILURE: Product not found in Analytics DB');
        }

        const order = await Order.findById(orderData._id);
        if (order) {
            console.log('SUCCESS: Order found in Analytics DB');
        } else {
            console.error('FAILURE: Order not found in Analytics DB');
        }

        await channel.close();
        await connection.close();
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testIntegration();
