const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  offeredPrice: { type: Number, required: true },
  quantityOffered: { type: Number, required: true },
  deliveryDate: { type: String, required: true },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const RequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  requestType: { type: String, enum: ['Buyer', 'Seller'], required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Vegetables', 'Fruits', 'Seeds', 'Fertilizer', 'Equipment'], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true },
  startingPrice: { type: Number, required: true },
  biddingEndTime: { type: String, required: true },
  image: { type: String }, // <-- Added image field to store local preview URL or file string
  status: { type: String, default: 'Pending Match' },
  buyerName: { type: String, default: 'My Profile' },
  contact: { type: String, default: '+94 77 123 4567' },
  offers: [OfferSchema]
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);