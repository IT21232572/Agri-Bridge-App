const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, default: '' },
    recipientName: { type: String, default: '' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    requestId: { type: String },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);