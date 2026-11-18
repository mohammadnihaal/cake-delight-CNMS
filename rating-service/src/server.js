const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cakedelight';

async function start() {
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('[rating] connected to MongoDB');
      break;
    } catch (err) {
      console.error('[rating] MongoDB not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[rating] listening on ${PORT}`));
}

start();
