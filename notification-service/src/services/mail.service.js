const nodemailer = require('nodemailer');

// All mail settings come from environment variables (see notification-service/.env.example)
const host = process.env.SMTP_HOST || 'localhost';
const port = Number(process.env.SMTP_PORT || 1025);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const secure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : port === 465; // 465 = implicit TLS, 587/25/1025 = STARTTLS or plain
const from = process.env.MAIL_FROM || user || 'orders@cakedelight.local';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user ? { user, pass } : undefined,
  connectionTimeout: 10000,
  socketTimeout: 15000,
});

// Log once at startup whether the SMTP settings work (does not stop the service)
transporter
  .verify()
  .then(() => console.log(`[notification] SMTP ready: ${host}:${port} as "${from}"`))
  .catch((err) => console.error(`[notification] SMTP check failed for ${host}:${port}: ${err.message}`));

function buildMessage(order) {
  const lines = order.items.map((i) => `  - ${i.name} x${i.quantity}  $${(i.price * i.quantity).toFixed(2)}`);
  return [
    'Thank you for your order at Cake Delight!',
    '',
    `Order #${order.orderId}`,
    ...lines,
    '',
    `Total: $${Number(order.total).toFixed(2)}`,
  ].join('\n');
}

async function sendOrderConfirmation(order) {
  const text = buildMessage(order);
  const info = await transporter.sendMail({
    from: `Cake Delight <${from}>`,
    to: order.email,
    subject: `Your Cake Delight order is confirmed (#${order.orderId.slice(-6)})`,
    text,
  });
  // What the SMTP server said about each recipient (helps when "sent" mail does not arrive)
  console.log(
    `[notification] order ${order.orderId}: accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} response="${info.response}"`
  );
  if (info.rejected && info.rejected.length > 0) {
    throw new Error(`Recipient rejected by SMTP server: ${info.rejected.join(', ')}`);
  }
  return text;
}

module.exports = { sendOrderConfirmation };
