const express = require('express');
const notificationService = require('./services/notification.service');

const app = express();
app.use((req, res, next) => {
  console.log(`[notification] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// Delivery status of recent notifications
app.get('/notifications', async (req, res, next) => {
  try {
    res.json(await notificationService.list());
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('[notification] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
