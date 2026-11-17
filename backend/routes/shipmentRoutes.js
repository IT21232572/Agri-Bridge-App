const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const LogisticsAudit = require('../models/LogisticsAudit');
const { 
  calculateDistanceKm, 
  findOptimalDriverForShipment, 
  generateOptimizedRoute,
  SRI_LANKA_DISTRICT_COORDS 
} = require('../services/logisticsService');

// Helper to generate Unique Tracking Number
const generateTrackingNumber = () => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `TRK-${new Date().getFullYear()}-${randomSuffix}`;
};

// ==========================================
// 1. Get All Shipments (with Filters & Search)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { status, driverId, search, priority, delayed } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (delayed === 'true') {
      query.isDelayed = true;
    }

    if (driverId) {
      query['assignedDriver.driverId'] = driverId;
    }

    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { orderTitle: { $regex: search, $options: 'i' } },
        { 'sender.name': { $regex: search, $options: 'i' } },
        { 'sender.city': { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
        { 'recipient.city': { $regex: search, $options: 'i' } },
        { 'assignedDriver.name': { $regex: search, $options: 'i' } }
      ];
    }

    const shipments = await Shipment.find(query).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. Real-Time Tracking Lookup (Public & Auth)
// ==========================================
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await Shipment.findOne({ 
      trackingNumber: trackingNumber.trim().toUpperCase() 
    });

    if (!shipment) {
      return res.status(404).json({ error: `No active shipment found with tracking code: ${trackingNumber}` });
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Analytics & Report Generator
// (Must be defined before /:id route)
// ==========================================
router.get('/reports/analytics', async (req, res) => {
  try {
    const allShipments = await Shipment.find();
    const allDrivers = await User.find({ role: 'Driver' });

    // Completed deliveries
    const completedShipments = allShipments.filter(s => s.status === 'Delivered');
    
    // Delayed shipments (either flagged isDelayed, or past estimated delivery and not delivered)
    const now = new Date();
    const delayedShipments = allShipments.filter(s => {
      if (s.status === 'Delivered') {
        return s.actualDelivery && s.estimatedDelivery && new Date(s.actualDelivery) > new Date(s.estimatedDelivery);
      }
      return (s.isDelayed || (s.estimatedDelivery && new Date(s.estimatedDelivery) < now));
    });

    // In-Transit & Dispatched shipments
    const activeShipments = allShipments.filter(s => ['Dispatched', 'In-Transit'].includes(s.status));
    const pendingShipments = allShipments.filter(s => s.status === 'Pending');

    // Driver Performance Metrics
    const driverMetrics = allDrivers.map(driver => {
      const driverShipments = allShipments.filter(s => 
        s.assignedDriver?.driverId && s.assignedDriver.driverId.toString() === driver._id.toString()
      );

      const driverCompleted = driverShipments.filter(s => s.status === 'Delivered');
      const driverDelayed = driverShipments.filter(s => {
        if (s.status === 'Delivered') {
          return s.actualDelivery && s.estimatedDelivery && new Date(s.actualDelivery) > new Date(s.estimatedDelivery);
        }
        return s.isDelayed;
      });

      const totalAssigned = driverShipments.length;
      const completedCount = driverCompleted.length;
      const onTimeCount = Math.max(0, completedCount - driverDelayed.length);
      const onTimePercentage = completedCount > 0 
        ? Math.round((onTimeCount / completedCount) * 100) 
        : 100;

      return {
        driverId: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.driverDetails?.vehicleType || 'Truck',
        vehicleNumber: driver.driverDetails?.vehicleNumber || 'Unregistered',
        rating: driver.driverDetails?.rating || 5.0,
        currentStatus: driver.driverDetails?.currentStatus || 'Available',
        totalAssigned,
        completedCount,
        delayedCount: driverDelayed.length,
        onTimePercentage
      };
    });

    res.json({
      summary: {
        totalShipments: allShipments.length,
        pendingCount: pendingShipments.length,
        activeCount: activeShipments.length,
        completedCount: completedShipments.length,
        delayedCount: delayedShipments.length,
        totalDrivers: allDrivers.length,
        activeDriversCount: allDrivers.filter(d => d.driverDetails?.currentStatus === 'Available').length
      },
      completedShipments,
      delayedShipments,
      driverMetrics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Get Shipment by ID
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Create New Shipment
// ==========================================
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    if (!data.orderTitle || !data.sender?.name || !data.recipient?.name) {
      return res.status(400).json({ error: 'Order title, sender details, and recipient details are required.' });
    }

    const trackingNumber = generateTrackingNumber();

    // Calculate geocoordinates from district/city if not given
    const senderDistrict = data.sender?.district || 'Matale';
    const recipientDistrict = data.recipient?.district || 'Colombo';

    const senderCoords = SRI_LANKA_DISTRICT_COORDS[senderDistrict] || { lat: 7.8731, lng: 80.6511 };
    const recipientCoords = SRI_LANKA_DISTRICT_COORDS[recipientDistrict] || { lat: 6.9271, lng: 79.8612 };

    const distanceKm = calculateDistanceKm(
      senderCoords.lat, senderCoords.lng,
      recipientCoords.lat, recipientCoords.lng
    );

    const estimatedDurationMinutes = Math.round(distanceKm * 2.2); // approx avg road speed for cargo in Sri Lanka
    const optimizedRoute = generateOptimizedRoute(data.sender?.city || senderDistrict, data.recipient?.city || recipientDistrict);

    // Default estimated delivery (24-48 hours from now based on distance)
    const hoursToAdd = Math.max(12, Math.ceil(distanceKm / 15));
    const estimatedDelivery = data.estimatedDelivery 
      ? new Date(data.estimatedDelivery) 
      : new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

    const newShipment = new Shipment({
      trackingNumber,
      orderId: data.orderId || '',
      orderTitle: data.orderTitle,
      sender: {
        ...data.sender,
        lat: data.sender?.lat || senderCoords.lat,
        lng: data.sender?.lng || senderCoords.lng
      },
      recipient: {
        ...data.recipient,
        lat: data.recipient?.lat || recipientCoords.lat,
        lng: data.recipient?.lng || recipientCoords.lng
      },
      packageDetails: data.packageDetails || {
        category: 'Agricultural Produce',
        quantity: 100,
        unit: 'kg',
        weightKg: 100,
        specialHandling: 'Perishable / Keep Cool'
      },
      priority: data.priority || 'Standard',
      estimatedDelivery,
      routeOptimization: {
        distanceKm,
        estimatedDurationMinutes,
        optimizedRoute
      },
      trackingTimeline: [
        {
          status: 'Pending',
          location: `${data.sender?.city || senderDistrict} Regional Agro Station`,
          note: 'Shipment created and awaiting driver dispatch assignment.',
          updatedBy: 'Logistics Dispatch System'
        }
      ]
    });

    const savedShipment = await newShipment.save();

    await LogisticsAudit.create({
      action: 'SHIPMENT_CREATED',
      performedBy: { userId: 'User', name: data.sender?.name || 'Dispatcher', role: 'Seller' },
      targetEntity: { entityType: 'Shipment', entityId: savedShipment._id.toString(), identifier: trackingNumber },
      details: `Created shipment for ${savedShipment.orderTitle} (${distanceKm} km route)`
    });

    res.status(201).json(savedShipment);
  } catch (err) {
    console.error('Shipment creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. Intelligent Driver Auto-Assignment Algorithm
// ==========================================
router.post('/:id/auto-assign', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    if (shipment.status === 'Delivered') {
      return res.status(400).json({ error: 'Cannot reassign a shipment that has already been delivered.' });
    }

    const matchResult = await findOptimalDriverForShipment(shipment);

    if (!matchResult.success) {
      return res.status(404).json({ error: matchResult.message });
    }

    const bestDriver = matchResult.bestMatch;

    // Assign driver to shipment
    shipment.assignedDriver = {
      driverId: bestDriver._id,
      name: bestDriver.name,
      phone: bestDriver.phone,
      vehicleType: bestDriver.driverDetails?.vehicleType || 'Truck',
      vehicleNumber: bestDriver.driverDetails?.vehicleNumber || 'Standard',
      assignedAt: new Date()
    };

    shipment.status = 'Dispatched';
    shipment.trackingTimeline.push({
      status: 'Dispatched',
      location: `${shipment.sender?.city || 'Distribution Hub'} Dispatch Bay`,
      note: `Smart Auto-Assignment: Matched driver ${bestDriver.name} (${matchResult.distanceKm} km away, Score: ${matchResult.bestScore}/100, Vehicle: ${bestDriver.driverDetails?.vehicleType})`,
      updatedBy: 'AI Dispatch Engine'
    });

    const updatedShipment = await shipment.save();

    // Update driver status to 'On Delivery'
    bestDriver.driverDetails.currentStatus = 'On Delivery';
    await bestDriver.save();

    await LogisticsAudit.create({
      action: 'DRIVER_AUTO_ASSIGNED',
      performedBy: { userId: 'System', name: 'Smart Dispatch Engine', role: 'Admin' },
      targetEntity: { entityType: 'Shipment', entityId: shipment._id.toString(), identifier: shipment.trackingNumber },
      details: `Driver ${bestDriver.name} automatically assigned (Score: ${matchResult.bestScore}/100)`
    });

    res.json({
      message: `Driver ${bestDriver.name} successfully assigned via tracking & assignment algorithm!`,
      shipment: updatedShipment,
      matchDetails: {
        assignedDriver: bestDriver.name,
        distanceKm: matchResult.distanceKm,
        score: matchResult.bestScore,
        candidatesEvaluated: matchResult.candidates.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. Manual Driver Assignment
// ==========================================
router.post('/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'Driver') {
      return res.status(400).json({ error: 'Valid driver must be selected.' });
    }

    shipment.assignedDriver = {
      driverId: driver._id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.driverDetails?.vehicleType || 'Cargo Vehicle',
      vehicleNumber: driver.driverDetails?.vehicleNumber || 'Unassigned',
      assignedAt: new Date()
    };

    if (shipment.status === 'Pending') {
      shipment.status = 'Dispatched';
    }

    shipment.trackingTimeline.push({
      status: 'Dispatched',
      location: `${shipment.sender?.city || 'Origin'} Hub`,
      note: `Driver ${driver.name} assigned with ${driver.driverDetails?.vehicleType || 'vehicle'} (${driver.driverDetails?.vehicleNumber || ''})`,
      updatedBy: 'Dispatch Coordinator'
    });

    const updatedShipment = await shipment.save();

    driver.driverDetails.currentStatus = 'On Delivery';
    await driver.save();

    await LogisticsAudit.create({
      action: 'DRIVER_ASSIGNED',
      performedBy: { userId: 'Admin', name: 'Logistics Officer', role: 'Admin' },
      targetEntity: { entityType: 'Shipment', entityId: shipment._id.toString(), identifier: shipment.trackingNumber },
      details: `Driver ${driver.name} manually assigned`
    });

    res.json({ message: 'Driver assigned successfully', shipment: updatedShipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. Update Shipment Status & Milestone Note
// ==========================================
router.put('/:id/status', async (req, res) => {
  try {
    const { status, location, note, updatedBy, delayReason } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const oldStatus = shipment.status;
    if (status) shipment.status = status;

    if (delayReason) {
      shipment.isDelayed = true;
      shipment.delayReason = delayReason;
    }

    // Add tracking timeline milestone
    shipment.trackingTimeline.push({
      status: status || oldStatus,
      location: location || 'Transit Corridor',
      note: note || `Status updated from ${oldStatus} to ${status || oldStatus}`,
      updatedBy: updatedBy || 'Driver / Logistics Partner'
    });

    // If delivered
    if (status === 'Delivered') {
      shipment.actualDelivery = new Date();
      if (shipment.assignedDriver?.driverId) {
        const driver = await User.findById(shipment.assignedDriver.driverId);
        if (driver) {
          driver.driverDetails.currentStatus = 'Available';
          driver.driverDetails.totalDeliveries = (driver.driverDetails.totalDeliveries || 0) + 1;
          if (!shipment.isDelayed) {
            driver.driverDetails.onTimeDeliveries = (driver.driverDetails.onTimeDeliveries || 0) + 1;
          }
          await driver.save();
        }
      }
    }

    const updatedShipment = await shipment.save();

    await LogisticsAudit.create({
      action: 'STATUS_UPDATED',
      performedBy: { userId: 'Driver', name: updatedBy || 'Driver', role: 'Driver' },
      targetEntity: { entityType: 'Shipment', entityId: shipment._id.toString(), identifier: shipment.trackingNumber },
      details: `Status progressed to ${status} at ${location || 'Transit checkpoint'}`
    });

    res.json({ message: 'Shipment status updated', shipment: updatedShipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. Proof of Delivery Confirmation (OTP / Signature / Photo)
// ==========================================
router.post('/:id/verify-delivery', async (req, res) => {
  try {
    const { otp, recipientSignature, photoUrl, notes, verifiedBy } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    if (shipment.status === 'Delivered' && shipment.proofOfDelivery?.isVerified) {
      return res.status(400).json({ error: 'This shipment has already been verified and delivered.' });
    }

    // Verify OTP if method is OTP
    if (otp) {
      if (shipment.proofOfDelivery?.otp && shipment.proofOfDelivery.otp !== otp.toString().trim()) {
        return res.status(400).json({ error: 'Invalid delivery confirmation OTP code. Please verify with recipient.' });
      }
    }

    // Update proof of delivery confirmation
    shipment.proofOfDelivery.isVerified = true;
    shipment.proofOfDelivery.verifiedAt = new Date();
    if (recipientSignature) shipment.proofOfDelivery.recipientSignature = recipientSignature;
    if (photoUrl) shipment.proofOfDelivery.photoUrl = photoUrl;
    if (notes) shipment.proofOfDelivery.notes = notes;

    shipment.status = 'Delivered';
    shipment.actualDelivery = new Date();

    shipment.trackingTimeline.push({
      status: 'Delivered',
      location: `${shipment.recipient?.city || 'Destination'} Drop-off Point`,
      note: `Proof of Delivery verified successfully (${otp ? 'OTP Code Validated' : 'Digital Sign-off'}). Order handed over to recipient.`,
      updatedBy: verifiedBy || 'Recipient & Driver Handover'
    });

    const deliveredShipment = await shipment.save();

    // Release driver and update performance
    if (shipment.assignedDriver?.driverId) {
      const driver = await User.findById(shipment.assignedDriver.driverId);
      if (driver) {
        driver.driverDetails.currentStatus = 'Available';
        driver.driverDetails.totalDeliveries = (driver.driverDetails.totalDeliveries || 0) + 1;
        if (!shipment.isDelayed) {
          driver.driverDetails.onTimeDeliveries = (driver.driverDetails.onTimeDeliveries || 0) + 1;
        }
        await driver.save();
      }
    }

    await LogisticsAudit.create({
      action: 'PROOF_VERIFIED',
      performedBy: { userId: 'Recipient', name: verifiedBy || shipment.recipient?.name || 'Recipient', role: 'Buyer' },
      targetEntity: { entityType: 'Shipment', entityId: shipment._id.toString(), identifier: shipment.trackingNumber },
      details: 'Proof of delivery verified and confirmed'
    });

    res.json({
      message: 'Proof of Delivery confirmed! Shipment marked as Delivered.',
      shipment: deliveredShipment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. Seed Demo Shipments
// ==========================================
router.post('/seed-demo-shipments', async (req, res) => {
  try {
    const existing = await Shipment.countDocuments();
    if (existing > 0) {
      return res.json({ message: `Database already contains ${existing} shipments.`, count: existing });
    }

    const drivers = await User.find({ role: 'Driver' });
    const sunil = drivers.find(d => d.email === 'sunil.driver@agribridge.lk') || drivers[0];
    const kamal = drivers.find(d => d.email === 'kamal.driver@agribridge.lk') || drivers[1] || sunil;

    const demoShipments = [
      {
        trackingNumber: 'TRK-2026-88401',
        orderId: 'REQ-379',
        orderTitle: '500kg Premium Willard Mangoes',
        sender: {
          name: 'Nimal Fernando',
          phone: '+94 78 333 9911',
          pickupAddress: 'Block 4, Dedicated Economic Centre',
          city: 'Dambulla',
          district: 'Matale',
          lat: 7.8731,
          lng: 80.6511
        },
        recipient: {
          name: 'Ruwan Wijesinghe',
          phone: '+94 77 999 5544',
          deliveryAddress: 'Bay 12, Manning Wholesale Market',
          city: 'Peliyagoda',
          district: 'Gampaha',
          lat: 6.9649,
          lng: 79.8860
        },
        packageDetails: {
          category: 'Fruits',
          quantity: 500,
          unit: 'kg',
          weightKg: 500,
          specialHandling: 'Perishable / Keep Cool'
        },
        assignedDriver: sunil ? {
          driverId: sunil._id,
          name: sunil.name,
          phone: sunil.phone,
          vehicleType: sunil.driverDetails?.vehicleType,
          vehicleNumber: sunil.driverDetails?.vehicleNumber,
          assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        } : {},
        status: 'In-Transit',
        priority: 'Express',
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
        routeOptimization: {
          distanceKm: 148,
          estimatedDurationMinutes: 190,
          optimizedRoute: [
            'Dambulla Economic Center Hub',
            'Kurunegala Central Highway Interchange',
            'Mirigama Logistics Expressway Corridor',
            'Peliyagoda Manning Terminal'
          ]
        },
        trackingTimeline: [
          {
            status: 'Pending',
            location: 'Dambulla Agricultural Center',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            note: 'Harvest graded and packaged into ventilated crates.',
            updatedBy: 'Farmgate Dispatch'
          },
          {
            status: 'Dispatched',
            location: 'Dambulla Freight Hub',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            note: 'Loaded into refrigerated truck WP-LB-9482. Driver departed.',
            updatedBy: 'Driver Sunil Perera'
          },
          {
            status: 'In-Transit',
            location: 'Kurunegala Highway Gateway',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            note: 'Passing Kurunegala checkpoint. Climate control stable at 14°C.',
            updatedBy: 'Driver Sunil Perera'
          }
        ],
        proofOfDelivery: {
          method: 'OTP',
          otp: '492815',
          isVerified: false
        }
      },
      {
        trackingNumber: 'TRK-2026-92140',
        orderId: 'REQ-250',
        orderTitle: '1200kg Upcountry Carrots & Leeks',
        sender: {
          name: 'Keppetipola Farmers Guild',
          phone: '+94 77 444 8822',
          pickupAddress: 'Highland Farm Valley, Boralanda Road',
          city: 'Nuwara Eliya',
          district: 'Nuwara Eliya',
          lat: 6.9497,
          lng: 80.7891
        },
        recipient: {
          name: 'Lanka Fresh Supermarkets Logistics',
          phone: '+94 11 234 5678',
          deliveryAddress: 'Central Cold Storage, Orugodawatta',
          city: 'Colombo',
          district: 'Colombo',
          lat: 6.9271,
          lng: 79.8612
        },
        packageDetails: {
          category: 'Vegetables',
          quantity: 1200,
          unit: 'kg',
          weightKg: 1200,
          specialHandling: 'Heavy Load'
        },
        assignedDriver: kamal ? {
          driverId: kamal._id,
          name: kamal.name,
          phone: kamal.phone,
          vehicleType: kamal.driverDetails?.vehicleType,
          vehicleNumber: kamal.driverDetails?.vehicleNumber,
          assignedAt: new Date(Date.now() - 28 * 60 * 60 * 1000)
        } : {},
        status: 'Delivered',
        priority: 'Standard',
        estimatedDelivery: new Date(Date.now() - 12 * 60 * 60 * 1000),
        actualDelivery: new Date(Date.now() - 11 * 60 * 60 * 1000),
        routeOptimization: {
          distanceKm: 165,
          estimatedDurationMinutes: 240,
          optimizedRoute: ['Nuwara Eliya Depot', 'Gampola Transit', 'Kadugannawa Pass', 'Colombo Orugodawatta']
        },
        trackingTimeline: [
          {
            status: 'Pending',
            location: 'Nuwara Eliya Hub',
            timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
            note: 'Sorted and weighed at high-altitude depot.',
            updatedBy: 'Station Supervisor'
          },
          {
            status: 'Dispatched',
            location: 'Keppetipola Station',
            timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
            note: 'Loaded on Heavy Lorry CP-ND-6031.',
            updatedBy: 'Driver Kamal Bandara'
          },
          {
            status: 'In-Transit',
            location: 'Peradeniya Highway Section',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            note: 'En route without delay.',
            updatedBy: 'Driver Kamal Bandara'
          },
          {
            status: 'Delivered',
            location: 'Orugodawatta Receiving Warehouse',
            timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
            note: 'Goods received in perfect condition. Proof OTP 819203 verified.',
            updatedBy: 'Receiving Officer'
          }
        ],
        proofOfDelivery: {
          method: 'OTP',
          otp: '819203',
          isVerified: true,
          verifiedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
          notes: 'Signed by Warehouse Manager Priyantha.'
        }
      },
      {
        trackingNumber: 'TRK-2026-61029',
        orderId: 'REQ-108',
        orderTitle: '800kg Organic Red Rice',
        sender: {
          name: 'Rajarata Paddy Cooperative',
          phone: '+94 25 222 3344',
          pickupAddress: 'Paddy Silo #2, Industrial Zone',
          city: 'Anuradhapura',
          district: 'Anuradhapura',
          lat: 8.3114,
          lng: 80.4037
        },
        recipient: {
          name: 'Green Leaf Distributors',
          phone: '+94 77 123 7788',
          deliveryAddress: 'Distribution Depot, Wattala',
          city: 'Wattala',
          district: 'Gampaha',
          lat: 6.9895,
          lng: 79.8917
        },
        packageDetails: {
          category: 'Grains',
          quantity: 800,
          unit: 'kg',
          weightKg: 800,
          specialHandling: 'Express Dry'
        },
        status: 'Pending',
        priority: 'Standard',
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        routeOptimization: {
          distanceKm: 195,
          estimatedDurationMinutes: 260,
          optimizedRoute: ['Anuradhapura Agro Zone', 'Kurunegala Junction', 'Ambepussa Corridor', 'Wattala Depot']
        },
        trackingTimeline: [
          {
            status: 'Pending',
            location: 'Anuradhapura Agricultural Storage',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            note: 'Order finalized and moisture levels certified. Ready for driver dispatch.',
            updatedBy: 'Silo Superintendent'
          }
        ],
        proofOfDelivery: {
          method: 'OTP',
          otp: '739104',
          isVerified: false
        }
      },
      {
        trackingNumber: 'TRK-2026-30419',
        orderId: 'REQ-502',
        orderTitle: '350kg Jaffna Red Onions',
        sender: {
          name: 'Northern Agro Producers Ltd',
          phone: '+94 21 222 9988',
          pickupAddress: 'Tirunelveli Farmers Market',
          city: 'Jaffna',
          district: 'Jaffna',
          lat: 9.6615,
          lng: 80.0255
        },
        recipient: {
          name: 'Colombo Central Canteen Suppliers',
          phone: '+94 71 200 4000',
          deliveryAddress: 'Old Moor Street Bulk Yard',
          city: 'Colombo',
          district: 'Colombo',
          lat: 6.9271,
          lng: 79.8612
        },
        packageDetails: {
          category: 'Vegetables',
          quantity: 350,
          unit: 'kg',
          weightKg: 350,
          specialHandling: 'Perishable / Keep Cool'
        },
        status: 'Dispatched',
        isDelayed: true,
        delayReason: 'Heavy monsoon rains and road repairs on A9 Highway section near Medawachchiya.',
        priority: 'Urgent',
        estimatedDelivery: new Date(Date.now() - 5 * 60 * 60 * 1000), // Overdue = Delayed
        routeOptimization: {
          distanceKm: 395,
          estimatedDurationMinutes: 480,
          optimizedRoute: ['Jaffna Market', 'Vavuniya Transit', 'Medawachchiya', 'Dambulla', 'Colombo']
        },
        trackingTimeline: [
          {
            status: 'Pending',
            location: 'Jaffna Agrarian Market Hub',
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
            note: 'Packed in breathable mesh bags.',
            updatedBy: 'Hub Coordinator'
          },
          {
            status: 'Dispatched',
            location: 'Jaffna Exit Checkpoint',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            note: 'Carrier vehicle dispatched toward Colombo.',
            updatedBy: 'Logistics Desk'
          },
          {
            status: 'In-Transit',
            location: 'Medawachchiya Bypass',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            note: 'Delayed: Weather conditions and traffic diversion. Driver notified dispatch.',
            updatedBy: 'Control Tower Alert'
          }
        ],
        proofOfDelivery: {
          method: 'OTP',
          otp: '294109',
          isVerified: false
        }
      }
    ];

    await Shipment.insertMany(demoShipments);

    res.json({ message: `Successfully seeded ${demoShipments.length} demo shipments with active tracking data.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
