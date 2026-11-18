const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    cakeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, default: '' },
    status: { type: String, enum: ['BASKET', 'CONFIRMED'], default: 'BASKET' },
    items: { type: [itemSchema], default: [] },
    total: { type: Number, default: 0 },
  },
  { collection: 'orders', timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
