const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LogisticsAudit = require('../models/LogisticsAudit');
const { authenticate, optionalAuth, JWT_SECRET } = require('../middleware/auth');
const { SRI_LANKA_DISTRICT_COORDS } = require('../services/logisticsService');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// ==========================================
// 1. User Registration
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, driverDetails } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Please provide name, email, password, and phone number.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Set geocoordinates from district if provided
    let loc = location || {};
    if (loc.district && SRI_LANKA_DISTRICT_COORDS[loc.district]) {
      loc.lat = SRI_LANKA_DISTRICT_COORDS[loc.district].lat;
      loc.lng = SRI_LANKA_DISTRICT_COORDS[loc.district].lng;
    }

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'Buyer',
      phone,
      location: loc,
      driverDetails: driverDetails || {}
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    // Audit log
    await LogisticsAudit.create({
      action: 'USER_REGISTER',
      performedBy: { userId: savedUser._id.toString(), name: savedUser.name, role: savedUser.role },
      targetEntity: { entityType: 'User', entityId: savedUser._id.toString(), identifier: savedUser.email },
      details: `New account registered as ${savedUser.role}`
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: savedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// ==========================================
// 2. User Authentication (Login)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact Admin.' });
    }

    const token = generateToken(user);

    // Audit log
    await LogisticsAudit.create({
      action: 'USER_LOGIN',
      performedBy: { userId: user._id.toString(), name: user.name, role: user.role },
      targetEntity: { entityType: 'User', entityId: user._id.toString(), identifier: user.email },
      details: `User logged in from ${req.ip || '127.0.0.1'}`
    });

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// ==========================================
// 3. Get Current User Profile
// ==========================================
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Update User Profile
// ==========================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location, driverDetails } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    if (location) {
      user.location = { ...user.location.toObject(), ...location };
      if (location.district && SRI_LANKA_DISTRICT_COORDS[location.district]) {
        user.location.lat = SRI_LANKA_DISTRICT_COORDS[location.district].lat;
        user.location.lng = SRI_LANKA_DISTRICT_COORDS[location.district].lng;
      }
    }

    if (user.role === 'Driver' && driverDetails) {
      user.driverDetails = { ...user.driverDetails.toObject(), ...driverDetails };
    }

    const updatedUser = await user.save();

    await LogisticsAudit.create({
      action: 'PROFILE_UPDATE',
      performedBy: { userId: user._id.toString(), name: user.name, role: user.role },
      targetEntity: { entityType: 'User', entityId: user._id.toString(), identifier: user.email },
      details: 'Profile details updated'
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Get All Users (Directory & Management)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. Manage User Role & Account Status (Admin)
// ==========================================
router.put('/:id/role', async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // STRICT PROTECTION: Admin accounts cannot be demoted or suspended
    if (user.role === 'Admin' || user.email === 'admin@agribridge.lk') {
      if (role && role !== 'Admin') {
        return res.status(403).json({ error: 'Security Protection: Administrator profile cannot be demoted or changed.' });
      }
      if (status && status === 'Suspended') {
        return res.status(403).json({ error: 'Security Protection: Administrator profile cannot be suspended.' });
      }
    }

    const oldRole = user.role;
    if (role) user.role = role;
    if (status) user.status = status;

    const updatedUser = await user.save();

    await LogisticsAudit.create({
      action: 'ROLE_UPDATE',
      performedBy: { userId: 'Admin', name: 'Administrator', role: 'Admin' },
      targetEntity: { entityType: 'User', entityId: user._id.toString(), identifier: user.email },
      details: `Role updated from ${oldRole} to ${user.role}, Status: ${user.status}`
    });

    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6.1 Delete User Account (Strict Admin Deletion Lock)
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // STRICT RULE: No one can delete the Admin's profile!
    if (userToDelete.role === 'Admin' || userToDelete.email === 'admin@agribridge.lk') {
      return res.status(403).json({ 
        error: 'Security Violation: Administrator profiles are permanently protected. No one can delete the Admin profile!' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await LogisticsAudit.create({
      action: 'USER_DELETED',
      performedBy: { userId: 'Admin', name: 'Administrator', role: 'Admin' },
      targetEntity: { entityType: 'User', entityId: userToDelete._id.toString(), identifier: userToDelete.email },
      details: `Deleted user ${userToDelete.name} (${userToDelete.email}) with role ${userToDelete.role}`
    });

    res.json({ message: `User ${userToDelete.name} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. Get All Drivers (Logistics Fleet)
// ==========================================
router.get('/drivers/list', async (req, res) => {
  try {
    const { availableOnly, district } = req.query;
    let query = { role: 'Driver', status: 'Active' };

    if (availableOnly === 'true') {
      query['driverDetails.isAvailable'] = true;
    }

    if (district) {
      query.$or = [
        { 'location.district': district },
        { 'driverDetails.operatingDistricts': district }
      ];
    }

    const drivers = await User.find(query).sort({ 'driverDetails.rating': -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. Toggle Driver Availability & Current Status
// ==========================================
router.put('/drivers/:id/availability', async (req, res) => {
  try {
    const { isAvailable, currentStatus } = req.body;
    const driver = await User.findOne({ _id: req.params.id, role: 'Driver' });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (typeof isAvailable === 'boolean') {
      driver.driverDetails.isAvailable = isAvailable;
      driver.driverDetails.currentStatus = isAvailable ? 'Available' : 'Off Duty';
    }

    if (currentStatus) {
      driver.driverDetails.currentStatus = currentStatus;
      driver.driverDetails.isAvailable = (currentStatus === 'Available');
    }

    const savedDriver = await driver.save();
    res.json({ message: 'Driver status updated', driver: savedDriver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. Seed Demo Users for Evaluation & Testing
// ==========================================
router.post('/seed-demo-users', async (req, res) => {
  try {
    const defaultPassword = 'password123';
    const demoAccounts = [
      {
        name: 'Admin Manager',
        email: 'admin@agribridge.lk',
        password: defaultPassword,
        role: 'Admin',
        phone: '+94 77 100 2001',
        location: { address: 'HQ Agrarian Tower', city: 'Colombo', district: 'Colombo', lat: 6.9271, lng: 79.8612 }
      },
      {
        name: 'Sunil Perera (Express Driver)',
        email: 'sunil.driver@agribridge.lk',
        password: defaultPassword,
        role: 'Driver',
        phone: '+94 71 888 4421',
        location: { address: 'Dambulla Dedicated Economic Centre', city: 'Dambulla', district: 'Matale', lat: 7.8731, lng: 80.6511 },
        driverDetails: {
          vehicleType: 'Refrigerated Truck',
          vehicleNumber: 'WP-LB-9482',
          licenseNumber: 'B-3829104',
          isAvailable: true,
          currentStatus: 'Available',
          rating: 4.9,
          totalDeliveries: 42,
          onTimeDeliveries: 40,
          operatingDistricts: ['Matale', 'Colombo', 'Kandy', 'Kurunegala']
        }
      },
      {
        name: 'Kamal Bandara (Heavy Cargo Driver)',
        email: 'kamal.driver@agribridge.lk',
        password: defaultPassword,
        role: 'Driver',
        phone: '+94 76 555 1290',
        location: { address: 'Keppetipola Agro Park', city: 'Badulla', district: 'Badulla', lat: 6.9934, lng: 81.0550 },
        driverDetails: {
          vehicleType: 'Heavy Lorry',
          vehicleNumber: 'CP-ND-6031',
          licenseNumber: 'B-1092834',
          isAvailable: true,
          currentStatus: 'Available',
          rating: 4.8,
          totalDeliveries: 35,
          onTimeDeliveries: 33,
          operatingDistricts: ['Badulla', 'Nuwara Eliya', 'Colombo']
        }
      },
      {
        name: 'Nimal Fernando (Produce Seller)',
        email: 'nimal.seller@agribridge.lk',
        password: defaultPassword,
        role: 'Seller',
        phone: '+94 78 333 9911',
        location: { address: 'Green Valley Organic Farm', city: 'Dambulla', district: 'Matale', lat: 7.8731, lng: 80.6511 }
      },
      {
        name: 'Ruwan Wijesinghe (Wholesale Buyer)',
        email: 'ruwan.buyer@agribridge.lk',
        password: defaultPassword,
        role: 'Buyer',
        phone: '+94 77 999 5544',
        location: { address: 'Manning Market Complex', city: 'Peliyagoda', district: 'Gampaha', lat: 6.9649, lng: 79.8860 }
      }
    ];

    let seededCount = 0;
    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        const u = new User(acc);
        await u.save();
        seededCount++;
      }
    }

    res.json({ message: `Seeded ${seededCount} demo users (password: 'password123')` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
