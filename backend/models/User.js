const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '+94 77 000 0000' },
  district: { type: String, default: 'Colombo' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);