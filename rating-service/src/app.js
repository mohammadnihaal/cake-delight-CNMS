const express = require('express');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[rating] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'rating-service' }));
app.use('/ratings', require('./routes/rating.routes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('[rating] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
