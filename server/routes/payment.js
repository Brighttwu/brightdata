const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
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

// Initialize Paystack Payment
router.post('/initialize', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 1) return res.status(400).json({ message: 'Minimum amount is GH₵1' });

        const reference = `BH_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const paystackAmount = Math.ceil(amount * 1.0195 * 100);

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: req.user.email,
            amount: paystackAmount,
            reference,
            currency: 'GHS',
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet`
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Save pending transaction
        await Transaction.create({
            user: req.user._id,
            type: 'deposit',
            amount: Number(amount),
            status: 'pending',
            reference,
            description: `Wallet top-up of GH₵${amount}`,
            balanceBefore: req.user.balance,
            balanceAfter: req.user.balance
        });

        res.json({
            authorization_url: response.data.data.authorization_url,
            reference
        });
    } catch (err) {
        console.error('Paystack Init Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to initialize payment' });
    }
});

// Verify Paystack Payment
router.get('/verify/:reference', auth, async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const data = response.data.data;

        if (data.status === 'success') {
            const transaction = await Transaction.findOne({ reference });
            if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
            if (transaction.status === 'success') return res.json({ message: 'Already verified', balance: req.user.balance });

            const balanceBefore = req.user.balance;
            req.user.balance += transaction.amount;
            await req.user.save();

            transaction.status = 'success';
            transaction.balanceAfter = req.user.balance;
            await transaction.save();

            res.json({ message: 'Payment verified', balance: req.user.balance });
        } else {
            await Transaction.updateOne({ reference }, { status: 'failed' });
            res.status(400).json({ message: 'Payment was not successful' });
        }
    } catch (err) {
        console.error('Paystack Verify Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Verification failed' });
    }
});

// Get user transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

module.exports = router;
