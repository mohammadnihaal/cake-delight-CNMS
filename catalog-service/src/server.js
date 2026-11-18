const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cakedelight';

async function start() {
  // Retry until MongoDB is reachable (it may still be starting in Docker/Kubernetes)
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('[catalog] connected to MongoDB');
      break;
    } catch (err) {
      console.error('[catalog] MongoDB not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[catalog] listening on ${PORT}`));
}

start();
