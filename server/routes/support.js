const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'support_media',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const upload = multer({ storage: storage });

// Upload image route
router.post('/upload', auth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ imageUrl: req.file.path });
});

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            if (!user) return res.status(401).json({ message: 'User not found' });
            req.user = user;
            next();
        }).catch(() => {
            res.status(401).json({ message: 'Token is not valid' });
        });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Admin Auth Middleware
const adminAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });
            req.user = user;
            next();
        }).catch(() => {
            res.status(401).json({ message: 'Token is not valid' });
        });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Send a message (User View)
router.post('/send', auth, async (req, res) => {
    try {
        const { message, image } = req.body;
        if (!message && !image) return res.status(400).json({ message: 'Message or Image is required' });

        const newMessage = new SupportMessage({
            user: req.user._id,
            sender: req.user._id,
            message: message || '',
            image: image || '',
            isAdmin: req.user.role === 'admin'
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Admin Reply
router.post('/admin-reply/:userId', adminAuth, async (req, res) => {
    try {
        const { message, image } = req.body;
        const { userId } = req.params;
        if (!message && !image) return res.status(400).json({ message: 'Message or Image is required' });

        const newMessage = new SupportMessage({
            user: userId,
            sender: req.user._id,
            message: message || '',
            image: image || '',
            isAdmin: true
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending reply' });
    }
});

// Get messages for current user
router.get('/messages', auth, async (req, res) => {
    try {
        const messages = await SupportMessage.find({ user: req.user._id })
            .sort({ createdAt: 1 });
        
        // Mark as read when user views them (only those sent by admin)
        await SupportMessage.updateMany(
            { user: req.user._id, isAdmin: true, isRead: false },
            { isRead: true }
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Admin: Get all conversations (latest message per user)
router.get('/admin/conversations', adminAuth, async (req, res) => {
    try {
        const conversations = await SupportMessage.aggregate([
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: '$user',
                lastMessage: { $first: '$message' },
                lastSender: { $first: '$sender' },
                createdAt: { $first: '$createdAt' },
                unreadCount: { 
                    $sum: { 
                        $cond: [{ $and: [{ $eq: ["$isAdmin", false] }, { $eq: ["$isRead", false] }] }, 1, 0] 
                    } 
                }
            }},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }},
            { $unwind: '$userDetails' },
            { $project: {
                'userDetails.password': 0,
                'userDetails.resetOtp': 0,
                'userDetails.resetOtpExpire': 0
            }},
            { $sort: { createdAt: -1 } }
        ]);

        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Admin: Get messages for a specific user
router.get('/admin/messages/:userId', adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await SupportMessage.find({ user: userId })
            .sort({ createdAt: 1 });

        // Mark user's messages as read by admin
        await SupportMessage.updateMany(
            { user: userId, isAdmin: false, isRead: false },
            { isRead: true }
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Get unread count for current user
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await SupportMessage.countDocuments({
            user: req.user._id,
            isAdmin: true,
            isRead: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching unread count' });
    }
});

// Get unread count for admin (total messages from users)
router.get('/admin/unread-count', adminAuth, async (req, res) => {
    try {
        const count = await SupportMessage.countDocuments({
            isAdmin: false,
            isRead: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching unread count' });
    }
});

module.exports = router;
