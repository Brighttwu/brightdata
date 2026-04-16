const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware for private routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const jwt = require('jsonwebtoken');
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

// Get User Profile
router.get('/profile', auth, async (req, res) => {
    // Safety check for legacy users
    if (!req.user.referralCode) {
        req.user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await req.user.save();
    }
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        balance: req.user.balance,
        role: req.user.role,
        referralCode: req.user.referralCode,
        momoNumber: req.user.momoNumber,
        phoneNumber: req.user.phoneNumber,
        referralBalance: req.user.referralBalance,
        apiKey: req.user.apiKey
    });
});

// Generate/Rotate API Key
router.post('/generate-api-key', auth, async (req, res) => {
    try {
        const crypto = require('crypto');
        const newKey = crypto.randomBytes(32).toString('hex');
        req.user.apiKey = newKey;
        await req.user.save();
        res.json({ message: 'API key generated successfully', apiKey: newKey });
    } catch (err) {
        res.status(500).json({ message: 'Error generating API key' });
    }
});

// Update Profile
router.post('/update-profile', auth, async (req, res) => {
    try {
        const { name, momoNumber, phoneNumber } = req.body;
        if (name) req.user.name = name;
        if (momoNumber) req.user.momoNumber = momoNumber;
        if (phoneNumber) req.user.phoneNumber = phoneNumber;
        await req.user.save();
        res.json({ message: 'Profile updated successfully', user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        req.user.password = newPassword; // Pre-save hook will hash this
        await req.user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
