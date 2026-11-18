const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },
  },
  { collection: 'cakes', timestamps: true }
);

module.exports = mongoose.model('Cake', cakeSchema);
