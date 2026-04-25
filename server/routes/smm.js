const express = require('express');
const router = express.Router();
const axios = require('axios');
const SMMOrder = require('../models/SMMOrder');
const SMMService = require('../models/SMMService');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SupportMessage = require('../models/SupportMessage');
const { handleReferralCommission } = require('../utils/referralHelper');

const API_KEY = process.env.SMM_API_KEY;
const API_URL = process.env.SMM_API_URL || 'https://smmprovider.co/api/v2';

// Markup Configuration
const MARKUP_MULTIPLIER = 1.4; // 40% Profit
const MINIMUM_PRICE = 4.0;    // ₵4 Minimum

// Middleware for private routes
const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access denied' });
    }
};

// Boosting Toggle Middleware
const boostingCheck = async (req, res, next) => {
    const settings = await Settings.findOne();
    if (settings && !settings.isBoostingEnabled && req.user?.role !== 'admin') {
        return res.status(400).json({ message: 'Social Media Boosting is temporarily disabled by admin.' });
    }
    next();
};

// Get SMM Services (Public with Markup)
router.get('/services', boostingCheck, async (req, res) => {
    try {
        // Fetch from our local cache
        const localServices = await SMMService.find({ isDisabled: { $ne: true } });
        
        // If cache empty, sync once
        if (localServices.length === 0) {
            await syncServicesInternal();
            const refreshed = await SMMService.find({ isDisabled: { $ne: true } });
            return res.json(applyMarkup(refreshed));
        }

        res.json(applyMarkup(localServices));
    } catch (err) {
        console.error('SMM Services fetch error:', err.message);
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// Admin: Sync Services from Provider
router.post('/admin/sync', auth, adminAuth, async (req, res) => {
    try {
        const result = await syncServicesInternal();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Sync failed' });
    }
});

// Admin: Toggle Service
router.post('/admin/toggle-service', auth, adminAuth, async (req, res) => {
    try {
        const { serviceId, isDisabled } = req.body;
        await SMMService.findOneAndUpdate({ service: serviceId }, { isDisabled });
        res.json({ message: `Service ${isDisabled ? 'disabled' : 'enabled'}` });
    } catch (err) {
        res.status(500).json({ message: 'Toggle failed' });
    }
});

// Admin: Get All Services (Including Disabled)
router.get('/admin/services', auth, adminAuth, async (req, res) => {
    try {
        const services = await SMMService.find().sort({ category: 1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Fetch failed' });
    }
});

// Helper: Apply Markup
const applyMarkup = (services) => {
    return services.map(s => {
        const rawRate = Number(s.rate);
        // Customer Rate per 1k = (ProviderRate * 1.4) 
        // We handle the ₵4 minimum per ORDER, but let's also ensure rate reflects minimum if quantity is 1k
        const markedUpRate = Number((rawRate * MARKUP_MULTIPLIER).toFixed(2));
        return {
            ...s.toObject(),
            rate: markedUpRate
        };
    });
};

// Helper: Internal Sync
async function syncServicesInternal() {
    console.log('Syncing SMM services...');
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'services');
    const response = await axios.post(API_URL, params);
    const apiServices = response.data;

    if (!Array.isArray(apiServices)) return { message: 'Api returned no services', count: 0 };

    for (const s of apiServices) {
        await SMMService.findOneAndUpdate(
            { service: s.service },
            { 
                name: s.name,
                category: s.category,
                rate: Number(s.rate),
                min: Number(s.min),
                max: Number(s.max),
                description: s.description || '',
                averageTime: s.average_time || s.time || '',
                refill: s.refill === true || s.refill === 'true' || s.refill === 1,
                lastUpdated: Date.now()
            },
            { upsert: true }
        );
    }
    return { message: 'Sync successful', count: apiServices.length };
}

// Create Order
router.post('/order', auth, boostingCheck, async (req, res) => {
    try {
        const { serviceId, link, quantity, customData } = req.body;
        const user = req.user;

        // 1. Validate service
        const service = await SMMService.findOne({ service: serviceId });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        if (service.isDisabled) return res.status(400).json({ message: 'This service is currently unavailable.' });

        // 2. Strict Server-Side Pricing
        // Price per 1k is (rate * 1.4)
        // Order Cost = (Quantity / 1000) * (rate * 1.4)
        const unitCost = (Number(service.rate) * MARKUP_MULTIPLIER) / 1000;
        let calculatedAmount = Number((unitCost * quantity).toFixed(2));
        
        // Apply Minimum Price Rule: No order below ₵4.00
        if (calculatedAmount < MINIMUM_PRICE) {
            calculatedAmount = MINIMUM_PRICE;
        }

        // 3. Security Check
        const dbUser = await User.findById(user._id);
        if (dbUser.balance < calculatedAmount) {
            return res.status(400).json({ message: `Insufficient balance. This order costs ₵${calculatedAmount.toFixed(2)}.` });
        }

        if (quantity < service.min || quantity > service.max) {
            return res.status(400).json({ message: `Quantity must be between ${service.min} and ${service.max}` });
        }

        // 4. API Call
        const external_reference = `SMM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const params = new URLSearchParams();
        params.append('key', API_KEY);
        params.append('action', 'add');
        params.append('service', serviceId);
        params.append('link', link);
        params.append('quantity', quantity);
        if (customData) params.append('comments', customData);

        const response = await axios.post(API_URL, params);
        const apiData = response.data;

        if (apiData.error) return res.status(400).json({ message: apiData.error });
        if (!apiData.order) return res.status(400).json({ message: 'Provider failed to create order' });

        // 5. ATOMIC-LIKE Deduct (Manual for simple consistency)
        dbUser.balance = Number((dbUser.balance - calculatedAmount).toFixed(2));
        await dbUser.save();

        // 6. Save Order Record
        const smmOrder = new SMMOrder({
            user: user._id,
            category: service.category,
            serviceId: service.service,
            serviceName: service.name,
            link,
            quantity,
            amount: calculatedAmount,
            cost: Number(((service.rate / 1000) * quantity).toFixed(2)), // API cost for analytics
            externalReference: external_reference,
            orderId: apiData.order,
            apiResponse: apiData,
            customData,
            refillable: service.refill,
            averageTime: service.averageTime,
            status: 'pending'
        });
        await smmOrder.save();

        // 7. Ledger
        await Transaction.create({
            user: user._id,
            type: 'purchase',
            amount: calculatedAmount,
            status: 'success',
            reference: external_reference,
            description: `Boosting: ${service.name} - ${link}`,
            balanceBefore: dbUser.balance + calculatedAmount,
            balanceAfter: dbUser.balance
        });

        await handleReferralCommission(user._id, calculatedAmount, external_reference);

        res.json({ order: smmOrder, balance: dbUser.balance });
    } catch (err) {
        console.error('SMM Order Error:', err.message);
        res.status(500).json({ message: 'Error processing boosting order' });
    }
});

// Status check and report routes remain similar
// Request Refill
router.post('/refill/:id', auth, async (req, res) => {
    try {
        const order = await SMMOrder.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!order.orderId) return res.status(400).json({ message: 'Order ID missing' });

        const params = new URLSearchParams();
        params.append('key', API_KEY);
        params.append('action', 'refill');
        params.append('order', order.orderId);

        const response = await axios.post(API_URL, params);
        if (response.data.error) return res.status(400).json({ message: response.data.error });
        
        res.json({ message: 'Refill requested successfully', data: response.data });
    } catch (err) {
        res.status(500).json({ message: 'Refill request failed' });
    }
});

router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await SMMOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

router.get('/status/:id', auth, async (req, res) => {
    try {
        const order = await SMMOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const params = new URLSearchParams();
        params.append('key', API_KEY);
        params.append('action', 'status');
        params.append('order', order.orderId);

        const response = await axios.post(API_URL, params);
        const apiData = response.data;

        if (apiData.status) {
            const statusMap = {
                'Pending': 'pending', 'In progress': 'processing', 'Completed': 'completed',
                'Partial': 'partial', 'Canceled': 'cancelled', 'Refunded': 'refunded'
            };
            order.status = statusMap[apiData.status] || apiData.status.toLowerCase();
            order.startCount = apiData.start_count || order.startCount;
            order.remains = apiData.remains || order.remains;
            order.updatedAt = Date.now();
            await order.save();
        }
        res.json({ order, apiResponse: apiData });
    } catch (err) {
        res.status(500).json({ message: 'Error checking status' });
    }
});

router.post('/report/:id', auth, async (req, res) => {
    try {
        const order = await SMMOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        const { reason } = req.body;
        order.isReported = true;
        order.reportReason = reason;
        await order.save();

        await SupportMessage.create({
            user: req.user._id, sender: req.user._id,
            message: `[BOOSTING REPORT] Order ${order.externalReference} reported. Reason: ${reason}`,
            isAdmin: false
        });
        res.json({ message: 'Report submitted', order });
    } catch (err) {
        res.status(500).json({ message: 'Error reporting' });
    }
});

module.exports = router;
