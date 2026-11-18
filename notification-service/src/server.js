const mongoose = require('mongoose');
const app = require('./app');
const consumer = require('./consumers/order.consumer');

const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cakedelight';

async function start() {
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('[notification] connected to MongoDB');
      break;
    } catch (err) {
      console.error('[notification] MongoDB not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[notification] listening on ${PORT}`));
  consumer.start();
}

start();
