const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Request = require('../models/Request');
const requestRoutes = require('../routes/requestRoutes');

// Setup a mock Express app for isolated unit testing
const app = express();
app.use(express.json());
app.use('/api/requests', requestRoutes);

// Connect to a test database or mock before tests
beforeAll(async () => {
  const MONGO_TEST_URI = process.env.MONGO_URI || 'mongodb://sandarunawoda2001_db_user:907sAndaRu25@ac-cw9alng-shard-00-00.lbhty5e.mongodb.net:27017,ac-cw9alng-shard-00-01.lbhty5e.mongodb.net:27017,ac-cw9alng-shard-00-02.lbhty5e.mongodb.net:27017/agri-bridge?ssl=true&replicaSet=atlas-138az8-shard-0&authSource=admin&retryWrites=true&w=majority';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Agri-Bridge Request API Unit & Security Tests', () => {
  
  // Test 1: Get All Requests (Core Functionality)
  test('GET /api/requests should return a 200 status and an array of requests', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // Test 2: Get Request by Custom ID (Security/Lookup Test)
  test('GET /api/requests/:id should handle non-existent IDs gracefully (404 Not Found)', async () => {
    const res = await request(app).get('/api/requests/REQ-999999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
  });

  // Test 3: Input Validation & Security Test (Rejecting invalid/missing required fields)
  test('POST /api/requests should reject requests missing required fields with a 400 error', async () => {
    const maliciousOrIncompleteData = {
      requestType: 'InvalidRole', // Should fail enum validation
      title: '' // Empty title
    };

    const res = await request(app)
      .post('/api/requests')
      .send(maliciousOrIncompleteData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

});