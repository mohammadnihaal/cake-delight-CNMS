const mongoose = require('mongoose');
const Cake = require('./models/cake.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cakedelight';

const cakes = [
  { name: 'Classic Chocolate Truffle', category: 'Chocolate', price: 24.5, description: 'Rich dark chocolate layers with silky ganache.' },
  { name: 'Belgian Chocolate Fudge', category: 'Chocolate', price: 28, description: 'Dense fudge cake finished with Belgian chocolate shavings.' },
  { name: 'Red Velvet Dream', category: 'Classic', price: 26, description: 'Velvety red sponge with cream cheese frosting.' },
  { name: 'Vanilla Bean Celebration', category: 'Classic', price: 20, description: 'Light vanilla sponge with whipped buttercream.' },
  { name: 'Strawberry Shortcake', category: 'Fruit', price: 22.75, description: 'Fresh strawberries folded into soft cream layers.' },
  { name: 'Mango Passion Delight', category: 'Fruit', price: 25, description: 'Tropical mango mousse on a passion fruit base.' },
  { name: 'Blueberry Cheesecake', category: 'Cheesecake', price: 27.5, description: 'Creamy baked cheesecake with a blueberry compote.' },
  { name: 'New York Cheesecake', category: 'Cheesecake', price: 29, description: 'Classic dense cheesecake on a buttery biscuit crust.' },
  { name: 'Lemon Drizzle Loaf', category: 'Loaf', price: 14, description: 'Zesty lemon loaf with a sugar glaze.' },
  { name: 'Carrot Walnut Cake', category: 'Classic', price: 21.5, description: 'Spiced carrot cake with walnuts and cream cheese icing.' },
];

(async () => {
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      break;
    } catch (err) {
      console.error('[seed] MongoDB not ready, retrying in 3s');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  const count = await Cake.countDocuments();
  if (count > 0) {
    console.log(`[seed] ${count} cakes already present, skipping`);
  } else {
    await Cake.insertMany(cakes);
    console.log(`[seed] inserted ${cakes.length} cakes`);
  }
  await mongoose.disconnect();
})();
