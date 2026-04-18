const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { sendAdminFundAlert } = require('../utils/emailHelper');

const API_KEY = process.env.BOSSU_API_KEY;
const API_URL = 'https://bossudatahub.com/api/v1/data';

// Global rate limiter for API (100 reqs per 15 mins)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: false, message: 'Too many requests, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for heavy actions like /buy (30 reqs per 15 mins)
const transactionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { status: false, message: 'Too many transaction attempts. Please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(apiLimiter);

// Middleware to authenticate via API Key
const apiKeyAuth = async (req, res, next) => {
    const key = req.header('x-api-key');
    if (!key) return res.status(401).json({ status: false, message: 'Missing API Key' });

    try {
        const user = await User.findOne({ apiKey: key });
        if (!user) return res.status(401).json({ status: false, message: 'Invalid API Key' });
        if (user.isBlocked) return res.status(403).json({ status: false, message: 'Account blocked' });

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ status: false, message: 'Server error during authentication' });
    }
};

// GET User Balance & Info
router.get('/user', apiKeyAuth, (req, res) => {
    res.json({
        status: true,
        data: {
            name: req.user.name,
            email: req.user.email,
            balance: req.user.balance,
            role: req.user.role
        }
    });
});

// GET Packages with user-specific pricing
router.get('/packages/:network', apiKeyAuth, async (req, res) => {
    try {
        const network = req.params.network.toLowerCase();
        const pkgParams = new URLSearchParams();
        pkgParams.append('action', 'packages');
        pkgParams.append('network', network);

        const response = await axios.post(API_URL, pkgParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const rawPackages = response.data.data || response.data.packages || [];
        const pricings = await Pricing.find({ network });

        const mappedPackages = rawPackages.map(p => {
            const pKey = (p.package_key || p.key || p.id || '').toString().trim();
            const rule = pricings.find(x => x.packageKey === pKey);

            let finalPrice = Number(p.price);
            if (rule) {
                if (['agent', 'store', 'admin'].includes(req.user.role) && rule.retailPrice > 0) {
                    finalPrice = rule.retailPrice;
                } else if (rule.normalPrice > 0) {
                    finalPrice = rule.normalPrice;
                }
            }

            return {
                name: p.display_name || p.name,
                package_key: pKey,
                price: Number(finalPrice.toFixed(2)),
                network: network
            };
        });

        res.json({ status: true, data: mappedPackages });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching packages' });
    }
});

// POST Buy Data
router.post('/buy', transactionLimiter, apiKeyAuth, async (req, res) => {
    try {
        const { network, package_key, phone } = req.body;
        if (!network || !package_key || !phone) {
            return res.status(400).json({ status: false, message: 'Missing required fields: network, package_key, phone' });
        }

        const user = req.user;
        const net = network.toLowerCase();
        const pkgKey = package_key.toString().trim();

        // 1. Get current prices from API & DB
        const pkgParams = new URLSearchParams();
        pkgParams.append('action', 'packages');
        pkgParams.append('network', net);

        const responsePkg = await axios.post(API_URL, pkgParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const rawPackages = responsePkg.data.data || responsePkg.data.packages || [];
        const basePkg = rawPackages.find(p => (p.package_key || p.key || p.id || '').toString().trim() === pkgKey);
        
        if (!basePkg) return res.status(400).json({ status: false, message: 'Invalid package key' });

        // 2. Determine price
        const pricing = await Pricing.findOne({ network: net, packageKey: pkgKey });
        let finalAmount = Number(basePkg.price);
        if (pricing) {
            if (['agent', 'store', 'admin'].includes(user.role) && pricing.retailPrice > 0) {
                finalAmount = pricing.retailPrice;
            } else if (pricing.normalPrice > 0) {
                finalAmount = pricing.normalPrice;
            }
        }

        // 3. Check balance
        if (user.balance < finalAmount) {
            return res.status(400).json({ status: false, message: 'Insufficient wallet balance' });
        }

        // 4. Check Provider API Balance
        const balParams = new URLSearchParams();
        balParams.append('action', 'balance');
        const balRes = await axios.post(API_URL, balParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const providerBalance = Number(balRes.data.balance || 0);

        if (providerBalance < basePkg.price) {
            await sendAdminFundAlert('Bossu Data Hub (API Endpoint)', providerBalance);
            return res.status(503).json({ status: false, message: 'System API balance low. Try again later.' });
        }

        // 5. Place Order
        const externalRef = `API_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        const buyParams = new URLSearchParams();
        buyParams.append('action', 'buy');
        buyParams.append('network', net);
        buyParams.append('package_key', pkgKey);
        buyParams.append('recipient_phone', phone);
        buyParams.append('external_reference', externalRef);

        const buyRes = await axios.post(API_URL, buyParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 45000
        });

        if (buyRes.data.status === 'success' || buyRes.data.success) {
            // Deduct balance and Save Order
            user.balance -= finalAmount;
            await user.save();

            const newOrder = new Order({
                user: user._id,
                network: net,
                packageKey: pkgKey,
                packageName: basePkg.display_name || basePkg.name,
                phoneNumber: phone,
                amount: finalAmount,
                cost: basePkg.price,
                status: 'completed',
                externalReference: externalRef,
                orderId: buyRes.data.order_id || buyRes.data.orderId,
                apiResponse: buyRes.data,
                source: 'api'
            });
            await newOrder.save();

            res.json({
                status: true,
                message: 'Transaction successful',
                order_id: newOrder._id,
                reference: externalRef,
                new_balance: user.balance
            });
        } else {
            const apiMsg = (buyRes.data.message || "").toLowerCase();
            if (apiMsg.includes('insufficient') || apiMsg.includes('balance')) {
                await sendAdminFundAlert('Bossu Data Hub (API Buy)', 0);
            }
            res.status(400).json({ status: false, message: buyRes.data.message || 'API order failed' });
        }
    } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

// GET Order Status
router.get('/order/:orderId', apiKeyAuth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
        if (!order) return res.status(404).json({ status: false, message: 'Order not found' });

        res.json({
            status: true,
            data: {
                order_id: order._id,
                packageName: order.packageName,
                phoneNumber: order.phoneNumber,
                amount: order.amount,
                status: order.status,
                reference: order.externalReference,
                createdAt: order.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching order status' });
    }
});

module.exports = router;
