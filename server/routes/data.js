const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const User = require('../models/User');
const Pricing = require('../models/Pricing');
const Transaction = require('../models/Transaction');
const { handleReferralCommission } = require('../utils/referralHelper');

const API_KEY = process.env.BOSSU_API_KEY;
const API_URL = process.env.BOSSU_API_URL;

// Middleware for private routes
const auth = (req, res, next) => {
    console.log(`[AUTH] Checking token for ${req.method} ${req.url}. next is: ${typeof next}`);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        console.log('[AUTH] No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            if (user && user.isBlocked) {
                console.log(`[AUTH] User ${decoded.id} is blocked`);
                return res.status(403).json({ message: 'Account blocked' });
            }
            req.user = user;
            if (typeof next !== 'function') {
                console.error('[AUTH ERROR] next is not a function!', typeof next);
                return res.status(500).json({ message: 'Internal Server Error: next is not a function' });
            }
            next();
        }).catch((err) => {
            console.error('[AUTH DB ERROR]', err.message);
            res.status(401).json({ message: 'Session invalid' });
        });
    } catch (err) {
        console.log('[AUTH JWT ERROR]', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Optional Auth Middleware to get Role for pricing
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        req.userRole = 'user';
        return next();
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            req.userRole = user ? user.role : 'user';
            req.user = user; // Set user for identifying admins
            next();
        }).catch(() => {
            req.userRole = 'user';
            next();
        });
    } catch {
        req.userRole = 'user';
        next();
    }
};

// Get Packages
router.get('/packages/:network', optionalAuth, async (req, res) => {
    try {
        console.log(`Fetching packages for ${req.params.network} (Role: ${req.userRole})...`);
        
        const params = new URLSearchParams();
        params.append('action', 'packages');
        params.append('network', req.params.network);

        const response = await axios.post(API_URL, params, {
            headers: { 
                'X-API-Key': API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const net = req.params.network.toString().toLowerCase();
        const pricings = await Pricing.find({ 
            network: { $regex: new RegExp(`^${net}$`, 'i') } 
        });
        console.log(`Backend Sync: Searching for rules on ${net}. Found: ${pricings.length} rules.`);
        if (pricings.length > 0) {
            console.log(`Active Rule Keys: [${pricings.map(x=>x.packageKey).join(', ')}]`);
        }

        const rawPackages = response.data.data || response.data.packages || [];
        const mappedPackages = rawPackages.map(p => {
            const apiPrice = Number(p.price);
            const pKey = (p.package_key || p.key || p.id || '').toString().trim(); // Keep original case
            const pKeyLower = pKey.toLowerCase();
            
            // Match DB key (stored as-is) against API key — compare lowercase on both sides
            const rule = pricings.find(x => 
                (x.packageKey || '').toString().trim().toLowerCase() === pKeyLower
            );

            let finalPrice = apiPrice;
            if (rule) {
                if (['agent', 'store', 'admin'].includes(req.userRole) && rule.retailPrice > 0) {
                    finalPrice = rule.retailPrice;
                } else if (rule.normalPrice > 0) {
                    finalPrice = rule.normalPrice;
                }
            }
            
            return {
                ...p,
                package_key: pKey,
                price: Number(finalPrice.toFixed(2))
            };
        });

        // Arrange from smallest
        mappedPackages.sort((a, b) => Number(a.price) - Number(b.price));

        res.json({ ...response.data, packages: mappedPackages });
    } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Error fetching packages' });
    }
});

// Get API Wallet Balance (Admin only or for internal check)
router.get('/api-balance', async (req, res) => {
    try {
        const balParams = new URLSearchParams();
        balParams.append('action', 'balance');
        const response = await axios.post(API_URL, balParams, {
            headers: { 
                'X-API-Key': API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching API balance' });
    }
});

// Create Order (Buy Data)
router.post('/buy', (req, res, next) => {
    // INLINE AUTH FOR STABILITY
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            if (!user) return res.status(401).json({ message: 'User not found' });
            req.user = user;
            next();
        }).catch(err => res.status(500).json({ message: 'Auth DB Error' }));
    } catch(e) { res.status(401).json({ message: 'Invalid token' }); }
}, async (req, res) => {
    try {
        console.log(`[BUY REQUEST START] User: ${req.user?.email}, Network: ${req.body.network}`);
        const { network, package_key, recipient_phone, package_name } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Not authenticated' });

        // SERVER-SIDE PRICE VALIDATION (Security)
        const net = network.toString().toLowerCase();
        const pkgKey = package_key.toString().trim().toLowerCase();
        const pricings = await Pricing.find({ network: { $regex: new RegExp(`^${net}$`, 'i') } });
        const pricing = pricings.find(x => (x.packageKey || '').toString().trim().toLowerCase() === pkgKey);
        
        let finalAmount = 0;
        const pkgParams = new URLSearchParams();
        pkgParams.append('action', 'packages');
        pkgParams.append('network', net);

        const responsePkg = await axios.post(API_URL, pkgParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const rawPackages = responsePkg.data.data || responsePkg.data.packages || [];
        const basePkg = rawPackages.find(p => (p.package_key || p.key || p.id || '').toString().trim().toLowerCase() === pkgKey);
        
        if (!basePkg) return res.status(400).json({ message: 'Invalid package' });
        
        const apiPrice = Number(basePkg.price);
        finalAmount = apiPrice; // Default to API price

        if (pricing) {
            if (['agent', 'store', 'admin'].includes(user.role) && pricing.retailPrice > 0) {
                finalAmount = pricing.retailPrice;
            } else if (pricing.normalPrice > 0) {
                finalAmount = pricing.normalPrice;
            }
        }
        
        const amount = finalAmount; // This is the safe amount

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const external_reference = `BD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Deduct balance first (can be refunded if failed)
        user.balance -= amount;
        await user.save();

        const buyParams = new URLSearchParams();
        buyParams.append('action', 'create_order');
        buyParams.append('network', network);
        buyParams.append('package_key', package_key);
        buyParams.append('recipient_phone', recipient_phone);
        buyParams.append('external_reference', external_reference);

        const response = await axios.post(API_URL, buyParams, {
            headers: { 
                'X-API-Key': API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const apiData = response.data.data || response.data; // Bossu wraps in .data

        const order = new Order({
            user: user._id,
            network,
            packageKey: package_key,
            packageName: package_name,
            phoneNumber: recipient_phone,
            amount: amount,
            externalReference: external_reference,
            orderId: apiData.order_id,
            apiResponse: response.data,
            status: (apiData.status === 'failed' || response.data.success === false) ? 'failed' : 'pending'
        });

        const orderFailed = apiData.status === 'failed' || response.data.success === false;
        if (orderFailed) {
            // Refund if API immediately fails
            user.balance += amount;
            await user.save();
        }

        const Transaction = require('../models/Transaction');
        await Transaction.create({
            user: user._id,
            type: 'purchase',
            amount: Number(amount),
            status: orderFailed ? 'failed' : 'success',
            reference: external_reference,
            description: `${network.toUpperCase()} ${package_name} - ${recipient_phone}`,
            balanceBefore: user.balance + (orderFailed ? 0 : Number(amount)),
            balanceAfter: user.balance
        });

        await order.save();
        
        // Referral Commission
        await handleReferralCommission(user._id, amount, external_reference);

        res.json({ order, balance: user.balance });
    } catch (err) {
        console.error('Data Order Catch Error:', err.response?.data || err.message);
        res.status(500).json({ 
            message: err.response?.data?.message || err.response?.data?.error || err.message || 'Error creating order',
            details: err.response?.data 
        });
    }
});

// Init direct Paystack order
router.post('/buy-paystack-init', auth, async (req, res) => {
    try {
        const { network, package_key, recipient_phone, package_name } = req.body;
        const user = req.user;

        // SERVER-SIDE PRICE VALIDATION (Security)
        const net = network.toString().toLowerCase();
        const pkgKey = package_key.toString().trim().toLowerCase();
        const pricings = await Pricing.find({ network: { $regex: new RegExp(`^${net}$`, 'i') } });
        const pricing = pricings.find(x => (x.packageKey || '').toString().trim().toLowerCase() === pkgKey);
        
        let finalAmount = 0;
        const pkgParams = new URLSearchParams();
        pkgParams.append('action', 'packages');
        pkgParams.append('network', net);

        const responsePkg = await axios.post(API_URL, pkgParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const rawPackages = responsePkg.data.data || responsePkg.data.packages || [];
        const basePkg = rawPackages.find(p => (p.package_key || p.key || p.id || '').toString().trim().toLowerCase() === pkgKey);
        
        if (!basePkg) return res.status(400).json({ message: 'Invalid package' });
        const apiPrice = Number(basePkg.price);
        finalAmount = apiPrice;

        if (pricing) {
            if ((user.role === 'agent' || user.role === 'store') && pricing.retailPrice > 0) {
                finalAmount = pricing.retailPrice;
            } else if (pricing.normalPrice > 0) {
                finalAmount = pricing.normalPrice;
            }
        }
        
        const amount = finalAmount;
        const reference = `BD_PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const order = new Order({
            user: user._id,
            network,
            packageKey: package_key,
            packageName: package_name,
            phoneNumber: recipient_phone,
            amount: amount,
            externalReference: reference,
            status: 'pending_payment'
        });
        await order.save();

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: user.email,
            amount: Math.round(amount * 100),
            reference,
            callback_url: 'http://localhost:5173/dashboard'
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        res.json({ authorization_url: response.data.data.authorization_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error initializing Paystack order' });
    }
});

// Verify Paystack order and execute
router.get('/buy-paystack-verify/:reference', auth, async (req, res) => {
    try {
        const { reference } = req.params;
        const order = await Order.findOne({ externalReference: reference });
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'pending_payment') return res.json({ message: 'Order already processed', order });

        const psRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        if (psRes.data.data.status === 'success') {
            // Paystack success, call Bossu API to actually buy the data
            const buyParams = new URLSearchParams();
            buyParams.append('action', 'create_order');
            buyParams.append('network', order.network);
            buyParams.append('package_key', order.packageKey);
            buyParams.append('recipient_phone', order.phoneNumber);
            buyParams.append('external_reference', reference);

            const response = await axios.post(API_URL, buyParams, { 
                headers: { 
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                } 
            });

            const bossuData = response.data.data || response.data; // Bossu wraps in .data
            order.orderId = bossuData.order_id;
            order.apiResponse = response.data;
            order.status = (bossuData.status === 'failed' || response.data.success === false) ? 'failed' : 'pending';
            
            // Log topup + purchase transaction history for transparency
            const Transaction = require('../models/Transaction');
            await Transaction.create({
                user: req.user._id,
                type: 'deposit',
                amount: order.amount,
                status: 'success',
                reference: `${reference}_dep`,
                description: `Paystack Deposit for ${order.packageName}`,
                balanceBefore: req.user.balance,
                balanceAfter: req.user.balance + order.amount
            });
            await Transaction.create({
                user: req.user._id,
                type: 'purchase',
                amount: order.amount,
                status: response.data.status === 'error' ? 'failed' : 'success',
                reference: reference,
                description: `${order.network.toUpperCase()} ${order.packageName} - ${order.phoneNumber}`,
                balanceBefore: req.user.balance + order.amount,
                balanceAfter: req.user.balance
            });

            await order.save();

            // Referral Commission
            await handleReferralCommission(req.user._id, order.amount, reference);

            res.json({ message: 'Payment verified and order submitted successfully.', order });
        } else {
            order.status = 'failed';
            await order.save();
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fulfilling Paystack order' });
    }
});

// Webhook for Bossu API (to update status)
router.post('/webhook', async (req, res) => {
    try {
        const { data } = req.body; // status: completed, failed, cancelled
        const order = await Order.findOne({ externalReference: data.reference });
        
        if (order && order.status === 'pending') {
            const user = await User.findById(order.user);
            
            if (data.status === 'failed' || data.status === 'cancelled') {
                // Refund user
                user.balance += order.amount;
                await user.save();
            }
            
            order.status = data.status;
            order.updatedAt = Date.now();
            await order.save();
        }
        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Error');
    }
});

// Get all orders for user
router.get('/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Check order status from Bossu API
router.get('/order-status/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // If we don't have a Bossu order ID yet, just return current DB status
        if (!order.orderId) {
            return res.json({ order, apiResponse: null, note: 'No vendor order ID yet' });
        }

        try {
            const statusParams = new URLSearchParams();
            statusParams.append('action', 'order_status');
            statusParams.append('order_id', order.orderId);

            const response = await axios.post(API_URL, statusParams, {
                headers: { 
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const apiData = response.data;
            
            // Handle "Order not found" from Bossu — don't crash
            if (apiData?.success === false) {
                return res.json({ order, apiResponse: apiData, note: apiData.message });
            }

            // Bossu may nest status inside .data or at top level
            const apiStatus = apiData?.data?.status || apiData?.status;
            
            if (apiStatus) {
                const statusMap = {
                    'completed': 'completed', 'delivered': 'completed', 'success': 'completed',
                    'failed': 'failed', 'cancelled': 'cancelled',
                    'pending': 'pending', 'processing': 'pending'
                };
                const mappedStatus = statusMap[apiStatus.toLowerCase()] || order.status;
                order.status = mappedStatus;
                order.updatedAt = Date.now();
                await order.save();
            }

            res.json({ order, apiResponse: apiData });

        } catch (apiErr) {
            // API call failed but we still return DB status — never show 500 to user
            console.error('Bossu API call failed:', apiErr.response?.data || apiErr.message);
            res.json({ order, apiResponse: null, note: 'Could not reach vendor API' });
        }

    } catch (err) {
        console.error('Order status DB error:', err.message);
        res.status(500).json({ message: 'Error fetching order from database' });
    }
});

// Report order to admin
router.post('/report-order/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        const { reason } = req.body;
        order.isReported = true;
        order.reportReason = reason || 'No reason provided';
        await order.save();

        res.json({ message: 'Order reported successfully to the admin.', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error reporting order' });
    }
});

module.exports = router;
