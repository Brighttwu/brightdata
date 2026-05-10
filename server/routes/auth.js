const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { sendOtpEmail } = require('../utils/emailHelper');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Rate limiters
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registrations per hour
    message: { message: 'Too many accounts created from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 mins
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const reservedNames = ['admin', 'administrator', 'root', 'superadmin', 'support', 'official', 'system', 'victim', 'users'];

// Register
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { name, email, password, referralCode, momoNumber, phoneNumber, captchaToken } = req.body;

        // 1. Verify reCAPTCHA
        if (!captchaToken) {
            return res.status(400).json({ message: 'Please complete the reCAPTCHA' });
        }

        try {
            const captchaResponse = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
            );
            if (!captchaResponse.data.success) {
                return res.status(400).json({ message: 'reCAPTCHA verification failed' });
            }
        } catch (captchaErr) {
            console.error('reCAPTCHA Error:', captchaErr);
            return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
        }

        // 2. Check for reserved names
        const lowerName = name.toLowerCase();
        const lowerEmail = email.toLowerCase();
        if (reservedNames.some(reserved => lowerName.includes(reserved) || lowerEmail.includes(reserved))) {
            return res.status(400).json({ message: 'This name or email is not allowed' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
            if (referrer) referredBy = referrer._id;
        }

        user = new User({ name, email, password, referredBy, momoNumber, phoneNumber });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, name: user.name, email: user.email, 
                balance: user.balance, role: user.role, referralCode: user.referralCode,
                momoNumber: user.momoNumber, phoneNumber: user.phoneNumber
            } 
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password, captchaToken } = req.body;

        // 1. Verify reCAPTCHA
        if (!captchaToken) {
            return res.status(400).json({ message: 'Please complete the reCAPTCHA' });
        }

        try {
            const captchaResponse = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
            );
            if (!captchaResponse.data.success) {
                return res.status(400).json({ message: 'reCAPTCHA verification failed' });
            }
        } catch (captchaErr) {
            console.error('reCAPTCHA Error:', captchaErr);
            return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                balance: user.balance,
                role: user.role,
                referralCode: user.referralCode,
                momoNumber: user.momoNumber,
                phoneNumber: user.phoneNumber
            } 
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        await sendOtpEmail(user.email, otp);
        return res.json({ message: 'An OTP has been sent to your email.' });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ message: 'Failed to request reset' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        
        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();
        
        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

module.exports = router;
