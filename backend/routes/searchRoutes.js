const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Request = require('../models/Request');

// Unified Search across Users, Drivers, Orders, and Deliveries
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.json({
        query: '',
        totalMatches: 0,
        users: [],
        drivers: [],
        shipments: [],
        orders: []
      });
    }

    const regex = new RegExp(q, 'i');

    const [users, drivers, shipments, orders] = await Promise.all([
      // 1. Users (excluding Drivers to keep categories distinct)
      User.find({
        role: { $ne: 'Driver' },
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { role: regex },
          { 'location.city': regex },
          { 'location.district': regex }
        ]
      }).limit(10).select('-password'),

      // 2. Drivers
      User.find({
        role: 'Driver',
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { 'driverDetails.vehicleType': regex },
          { 'driverDetails.vehicleNumber': regex },
          { 'driverDetails.currentStatus': regex },
          { 'location.city': regex },
          { 'location.district': regex }
        ]
      }).limit(10).select('-password'),

      // 3. Deliveries & Shipments
      Shipment.find({
        $or: [
          { trackingNumber: regex },
          { orderTitle: regex },
          { orderId: regex },
          { status: regex },
          { 'sender.name': regex },
          { 'sender.city': regex },
          { 'recipient.name': regex },
          { 'recipient.city': regex },
          { 'assignedDriver.name': regex }
        ]
      }).limit(10),

      // 4. Requests & Orders
      Request.find({
        $or: [
          { title: regex },
          { id: regex },
          { category: regex },
          { description: regex },
          { location: regex },
          { status: regex },
          { buyerName: regex }
        ]
      }).limit(10)
    ]);

    const totalMatches = users.length + drivers.length + shipments.length + orders.length;

    res.json({
      query: q,
      totalMatches,
      users,
      drivers,
      shipments,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
