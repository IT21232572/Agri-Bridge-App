const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  requestTitle: { type: String, required: true },
  sender: { type: String, default: 'Registered Partner' },
  offeredPrice: { type: Number, required: true },
  quantityOffered: { type: Number, required: true },
  deliveryDate: { type: String, required: true },
  remarks: { type: String },
  status: { type: String, default: 'Confirmed & Processing 🚚' }
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);