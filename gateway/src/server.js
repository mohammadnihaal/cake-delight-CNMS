// API Gateway: single entry point that routes /api/<service>/* to the right microservice.
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 8080;
const routes = {
  '/api/catalog': process.env.CATALOG_URL || 'http://localhost:3001',
  '/api/order': process.env.ORDER_URL || 'http://localhost:3002',
  '/api/rating': process.env.RATING_URL || 'http://localhost:3003',
  '/api/notification': process.env.NOTIFICATION_URL || 'http://localhost:3004',
};

const app = express();
app.use(cors());
app.use((req, res, next) => {
  console.log(`[gateway] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

// Note: no body parser here, so request bodies are streamed through untouched.
for (const [prefix, target] of Object.entries(routes)) {
  app.use(
    prefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${prefix}`]: '' },
      onError: (err, req, res) => {
        console.error(`[gateway] ${prefix} unreachable: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service unavailable' }));
      },
    })
  );
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`[gateway] listening on ${PORT}`, routes));
