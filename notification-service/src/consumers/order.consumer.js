// Listens for "order.completed" events published by the Order service.
const amqp = require('amqplib');
const notificationService = require('../services/notification.service');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = 'order.completed';

async function start() {
  for (;;) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      conn.on('close', () => {
        console.error('[notification] RabbitMQ connection closed, reconnecting');
        start();
      });
      conn.on('error', () => {});
      const channel = await conn.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });
      channel.prefetch(1);
      console.log('[notification] waiting for order.completed events');

      channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          await notificationService.handleOrderCompleted(event);
          channel.ack(msg);
        } catch (err) {
          console.error('[notification] bad message, dropping:', err.message);
          channel.nack(msg, false, false);
        }
      });
      return;
    } catch (err) {
      console.error('[notification] RabbitMQ not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

module.exports = { start };
