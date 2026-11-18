const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    cakeId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
  },
  { collection: 'ratings', timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
