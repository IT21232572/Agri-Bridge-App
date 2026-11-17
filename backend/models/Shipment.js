const mongoose = require('mongoose');

const TrackingTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Distribution Hub'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: String,
    default: 'System / Logistics Hub'
  }
}, { _id: true });

const ShipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: String,
    default: ''
  },
  orderTitle: {
    type: String,
    required: [true, 'Order title or commodity is required'],
    trim: true
  },
  sender: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    city: { type: String, default: 'Dambulla' },
    district: { type: String, default: 'Matale' },
    lat: { type: Number, default: 7.8731 },
    lng: { type: Number, default: 80.6511 }
  },
  recipient: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    city: { type: String, default: 'Colombo' },
    district: { type: String, default: 'Colombo' },
    lat: { type: Number, default: 6.9271 },
    lng: { type: Number, default: 79.8612 }
  },
  packageDetails: {
    category: { type: String, default: 'Agricultural Produce' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'kg' },
    weightKg: { type: Number, default: 50 },
    specialHandling: { 
      type: String, 
      enum: ['Standard', 'Perishable / Keep Cool', 'Fragile', 'Heavy Load', 'Express Dry'], 
      default: 'Perishable / Keep Cool' 
    }
  },
  assignedDriver: {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    vehicleType: { type: String, default: null },
    vehicleNumber: { type: String, default: null },
    assignedAt: { type: Date, default: null }
  },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'In-Transit', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['Standard', 'Urgent', 'Express'],
    default: 'Standard'
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  actualDelivery: {
    type: Date,
    default: null
  },
  isDelayed: {
    type: Boolean,
    default: false
  },
  delayReason: {
    type: String,
    default: ''
  },
  trackingTimeline: [TrackingTimelineSchema],
  proofOfDelivery: {
    method: {
      type: String,
      enum: ['OTP', 'Signature', 'Photo'],
      default: 'OTP'
    },
    otp: {
      type: String,
      default: () => Math.floor(100000 + Math.random() * 900000).toString() // 6 digit OTP
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    recipientSignature: {
      type: String,
      default: ''
    },
    photoUrl: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  routeOptimization: {
    distanceKm: { type: Number, default: 145 },
    estimatedDurationMinutes: { type: Number, default: 180 },
    optimizedRoute: [{ type: String }]
  }
}, { 
  timestamps: true 
});

// Middleware to check if delivery is delayed automatically
ShipmentSchema.pre('save', function() {
  if (this.status !== 'Delivered' && this.estimatedDelivery) {
    if (new Date() > new Date(this.estimatedDelivery)) {
      this.isDelayed = true;
      if (!this.delayReason) {
        this.delayReason = 'Transit schedule exceeded estimated arrival window';
      }
    }
  }
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
