const express = require('express');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[order] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));
app.use('/', require('./routes/order.routes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error('[order] error:', err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

module.exports = app;
