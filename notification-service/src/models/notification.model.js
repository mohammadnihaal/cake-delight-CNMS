const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    channel: { type: String, enum: ['EMAIL'], default: 'EMAIL' },
    status: { type: String, enum: ['SENT', 'FAILED'], required: true },
    message: { type: String, default: '' },
  },
  { collection: 'notifications', timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
