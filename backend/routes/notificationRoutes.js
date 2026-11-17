const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

const buildUserFilter = (user) => {
  const userId = String(user._id || user.id || '');
  const userName = (user.name || '').trim();
  const conditions = [];

  if (userId) conditions.push({ recipientId: userId });
  if (userName) {
    conditions.push({ recipientName: { $regex: new RegExp(`^${userName}$`, 'i') } });
  }
  return conditions.length > 0 ? { $or: conditions } : { _id: null };
};

// Get notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find(buildUserFilter(req.user))
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a notification
router.post('/', protect, async (req, res) => {
  try {
    const notification = new Notification({
      recipientId: String(req.body.recipientId || ''),
      recipientName: req.body.recipientName || '',
      title: req.body.title,
      message: req.body.message,
      requestId: req.body.requestId || ''
    });
    const saved = await notification.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark all as read
router.put('/mark-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { ...buildUserFilter(req.user), isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;