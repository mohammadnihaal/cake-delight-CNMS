// Publishes events to RabbitMQ. Only used for the "order.completed" event.
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = 'order.completed';

let channel = null;

async function connect() {
  for (;;) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      conn.on('close', () => {
        console.error('[order] RabbitMQ connection closed, reconnecting');
        channel = null;
        connect();
      });
      conn.on('error', () => {});
      channel = await conn.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });
      console.log('[order] connected to RabbitMQ');
      return;
    } catch (err) {
      console.error('[order] RabbitMQ not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

function publishOrderCompleted(event) {
  if (!channel) throw new Error('RabbitMQ channel not available');
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(event)), {
    persistent: true,
    contentType: 'application/json',
  });
}

module.exports = { connect, publishOrderCompleted };
