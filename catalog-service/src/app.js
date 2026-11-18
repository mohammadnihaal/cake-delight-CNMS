const express = require('express');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[catalog] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'catalog-service' }));
app.use('/cakes', require('./routes/cake.routes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('[catalog] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
