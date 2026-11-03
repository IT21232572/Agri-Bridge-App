const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single request by custom ID (e.g., REQ-653)
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findOne({ id: req.params.id });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new request/post
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a request (Edit Post)
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a request
router.delete('/:id', async (req, res) => {
  try {
    await Request.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an offer to a request
router.post('/:id/offers', async (req, res) => {
  try {
    const request = await Request.findOne({ id: req.params.id });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.offers.push(req.body);
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;