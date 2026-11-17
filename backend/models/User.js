const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Admin', 'Buyer', 'Seller', 'Driver'],
    default: 'Buyer'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: 'Colombo' },
    district: { type: String, default: 'Colombo' },
    lat: { type: Number, default: 6.9271 },
    lng: { type: Number, default: 79.8612 }
  },
  driverDetails: {
    vehicleType: { 
      type: String, 
      enum: ['Light Truck', 'Heavy Lorry', 'Pickup Van', 'Refrigerated Truck', 'Three-Wheeler', 'Tractor', 'Not Applicable'],
      default: 'Not Applicable' 
    },
    vehicleNumber: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    currentStatus: { 
      type: String, 
      enum: ['Available', 'On Delivery', 'Off Duty'], 
      default: 'Available' 
    },
    rating: { type: Number, default: 5.0 },
    totalDeliveries: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    operatingDistricts: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Pending Verification'],
    default: 'Active'
  }
}, { 
  timestamps: true 
});

// Hash password before saving if modified
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude password when converting to JSON
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
