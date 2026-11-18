const mongoose = require('mongoose');
const app = require('./app');
const publisher = require('./services/publisher.service');

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cakedelight';

async function start() {
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('[order] connected to MongoDB');
      break;
    } catch (err) {
      console.error('[order] MongoDB not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[order] listening on ${PORT}`));
  publisher.connect(); // keeps retrying in the background; the API works without it
}

start();
