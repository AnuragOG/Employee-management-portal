const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/attachments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get conversations (list of unique people I've talked to)
router.get('/conversations', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name email role avatar').populate('receiver', 'name email role avatar');

    const peopleMap = {};
    messages.forEach(msg => {
      const other = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      const otherId = other._id.toString();
      if (!peopleMap[otherId] || msg.createdAt > peopleMap[otherId].lastMessage.createdAt) {
        peopleMap[otherId] = { user: other, lastMessage: msg };
      }
    });

    res.json(Object.values(peopleMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages with specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).populate('sender', 'name avatar').populate('receiver', 'name avatar').sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/', protect, upload.single('attachment'), async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) return res.status(404).json({ message: 'Receiver not found' });

    // Role-based messaging rules
    const senderRole = req.user.role;
    const receiverRole = receiverUser.role;
    const validPairs = [
      ['admin', 'employee'], ['employee', 'admin'],
      ['admin', 'client'], ['client', 'admin'],
      ['employee', 'client'], ['client', 'employee']
    ];
    const isValid = validPairs.some(([s, r]) => s === senderRole && r === receiverRole);
    if (!isValid) return res.status(403).json({ message: 'Cannot message this user' });

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      attachment: req.file ? `/uploads/attachments/${req.file.filename}` : ''
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar').populate('receiver', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unread count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
