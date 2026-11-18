const Notification = require('../models/notification.model');
const mailService = require('./mail.service');

async function handleOrderCompleted(event) {
  // Idempotency: the broker may redeliver, never email the same order twice
  const already = await Notification.findOne({ orderId: event.orderId, status: 'SENT' });
  if (already) {
    console.log(`[notification] order ${event.orderId} already notified, skipping`);
    return already;
  }
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const message = await mailService.sendOrderConfirmation(event);
      return await Notification.create({ orderId: event.orderId, status: 'SENT', message });
    } catch (err) {
      lastError = err;
      console.error(`[notification] email attempt ${attempt}/3 failed: ${err.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return Notification.create({ orderId: event.orderId, status: 'FAILED', message: lastError.message });
}

const list = () => Notification.find().sort({ createdAt: -1 }).limit(50);

module.exports = { handleOrderCompleted, list };
