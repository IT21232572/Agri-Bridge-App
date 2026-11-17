const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const Deal = require('../models/Deal');


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

// Inside router.post('/', protect, async (req, res) => { ... })
router.post('/', protect, async (req, res) => {
  try {
    const newRequest = new Request({
      ...req.body,
      userId: req.user.id,
      buyerName: req.user.name // Overrides "My Profile" with the logged-in user's name
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
// Delete a request and its associated deals
router.delete('/:id', async (req, res) => {
  try {
    await Request.findOneAndDelete({ id: req.params.id });
    await Deal.deleteMany({ requestId: req.params.id });
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

    request.offers.push({
      sender: req.body.sender,
      senderId: req.body.senderId,
      senderLocation: req.body.senderLocation,
      senderContact: req.body.senderContact || '',
      sourceRequestId: req.body.sourceRequestId || null,
      sourceRequestTitle: req.body.sourceRequestTitle || '',
      offeredPrice: req.body.offeredPrice,
      quantityOffered: req.body.quantityOffered,
      deliveryDate: req.body.deliveryDate,
      remarks: req.body.remarks,
      status: 'Pending'
    });
    await request.save();
    await Notification.create({
    recipientId: String(request.userId || ''),
    recipientName: request.buyerName || '',
    title: '📩 New Offer Received',
    message: `${req.body.sender} offered LKR ${req.body.offeredPrice}/Kg for ${request.title} (${req.body.quantityOffered} Kg).`,
    requestId: request.id
  });
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;