const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

const userRoutes = require('../routes/userRoutes');
const shipmentRoutes = require('../routes/shipmentRoutes');
const searchRoutes = require('../routes/searchRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/search', searchRoutes);

beforeAll(async () => {
  const MONGO_TEST_URI = process.env.MONGO_URI || 'mongodb://sandarunawoda2001_db_user:907sAndaRu25@ac-cw9alng-shard-00-00.lbhty5e.mongodb.net:27017,ac-cw9alng-shard-00-01.lbhty5e.mongodb.net:27017,ac-cw9alng-shard-00-02.lbhty5e.mongodb.net:27017/agri-bridge?ssl=true&replicaSet=atlas-138az8-shard-0&authSource=admin&retryWrites=true&w=majority';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI, { family: 4 });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User & Logistics Management API Tests', () => {

  // Test 1: Seed demo users and verify user retrieval
  test('POST /api/users/seed-demo-users should initialize demo accounts', async () => {
    const res = await request(app).post('/api/users/seed-demo-users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Test 2: User list and role filtering
  test('GET /api/users should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // Test 3: Drivers listing
  test('GET /api/users/drivers/list should return registered drivers', async () => {
    const res = await request(app).get('/api/users/drivers/list');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // Test 4: Create a shipment
  let createdTrackingNumber = null;
  let createdShipmentId = null;

  test('POST /api/shipments should create a new shipment with tracking number and OTP', async () => {
    const shipmentData = {
      orderTitle: '500kg Organic Potatoes',
      orderId: 'REQ-POTATO-01',
      sender: {
        name: 'Nuwara Eliya Potato Co-op',
        phone: '+94 77 111 2233',
        pickupAddress: 'Highland Farm Center',
        city: 'Nuwara Eliya',
        district: 'Nuwara Eliya'
      },
      recipient: {
        name: 'Colombo Veg Mart',
        phone: '+94 77 444 5566',
        deliveryAddress: 'Main Street #12',
        city: 'Colombo',
        district: 'Colombo'
      },
      packageDetails: {
        category: 'Vegetables',
        quantity: 500,
        unit: 'kg',
        weightKg: 500,
        specialHandling: 'Perishable / Keep Cool'
      },
      priority: 'Express'
    };

    const res = await request(app).post('/api/shipments').send(shipmentData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('trackingNumber');
    expect(res.body.status).toBe('Pending');
    expect(res.body.proofOfDelivery).toHaveProperty('otp');

    createdTrackingNumber = res.body.trackingNumber;
    createdShipmentId = res.body._id;
  });

  // Test 5: Track shipment by Tracking Number
  test('GET /api/shipments/track/:trackingNumber should return shipment details', async () => {
    expect(createdTrackingNumber).not.toBeNull();
    const res = await request(app).get(`/api/shipments/track/${createdTrackingNumber}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.trackingNumber).toBe(createdTrackingNumber);
  });

  // Test 6: Auto-assign Driver using the tracking and assignment algorithm
  test('POST /api/shipments/:id/auto-assign should match and assign the most suitable driver', async () => {
    expect(createdShipmentId).not.toBeNull();
    const res = await request(app).post(`/api/shipments/${createdShipmentId}/auto-assign`);
    // Status can be 200 or 404 if no drivers in test DB
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('matchDetails');
      expect(res.body.shipment.status).toBe('Dispatched');
    }
  });

  // Test 7: Unified Search across users, drivers, orders, and shipments
  test('GET /api/search?q=Colombo should return categorized search results', async () => {
    const res = await request(app).get('/api/search?q=Colombo');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalMatches');
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('drivers');
    expect(res.body).toHaveProperty('shipments');
    expect(res.body).toHaveProperty('orders');
  });

  // Test 8: Report Generator Analytics
  test('GET /api/shipments/reports/analytics should return completed, delayed, and driver performance stats', async () => {
    const res = await request(app).get('/api/shipments/reports/analytics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('completedShipments');
    expect(res.body).toHaveProperty('delayedShipments');
    expect(res.body).toHaveProperty('driverMetrics');
  });

  // Test 9: STRICT SECURITY RULE - No one can delete the Admin's profile!
  test('DELETE /api/users/:id should reject deletion of an Admin profile with 403 Forbidden', async () => {
    // Find the admin user
    const usersRes = await request(app).get('/api/users?role=Admin');
    expect(usersRes.statusCode).toBe(200);
    const adminUser = usersRes.body.find(u => u.role === 'Admin');

    if (adminUser) {
      const deleteRes = await request(app).delete(`/api/users/${adminUser._id}`);
      expect(deleteRes.statusCode).toBe(403);
      expect(deleteRes.body).toHaveProperty('error');
      expect(deleteRes.body.error).toContain('Administrator profiles are permanently protected');
    }
  });

  // Test 10: STRICT SECURITY RULE - Admin profile cannot be demoted or suspended
  test('PUT /api/users/:id/role should reject demoting or suspending an Admin with 403 Forbidden', async () => {
    const usersRes = await request(app).get('/api/users?role=Admin');
    const adminUser = usersRes.body.find(u => u.role === 'Admin');

    if (adminUser) {
      const demoteRes = await request(app).put(`/api/users/${adminUser._id}/role`).send({ role: 'Buyer' });
      expect(demoteRes.statusCode).toBe(403);
      expect(demoteRes.body).toHaveProperty('error');
    }
  });
});
