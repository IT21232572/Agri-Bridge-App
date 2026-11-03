const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');

// Get all accepted deals
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new accepted deal
router.post('/', async (req, res) => {
  try {
    const newDeal = new Deal(req.body);
    const savedDeal = await newDeal.save();
    res.status(201).json(savedDeal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;