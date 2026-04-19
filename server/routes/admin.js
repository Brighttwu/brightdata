const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
const axios = require('axios');

// Admin Auth Middleware
const adminAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const jwt = require('jsonwebtoken');
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

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const { days } = req.query;
        const timeframe = days ? Number(days) : 1; // Default to 1 day (24h)
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - timeframe);

        const totalUsers = await User.countDocuments();
        const totalAgents = await User.countDocuments({ role: { $in: ['agent', 'store'] } });
        const totalOrders = await Order.countDocuments();
        
        // Sum of all user balances
        const walletTotals = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);

        // Calculate earnings (sum of all successful purchase transactions) within timeframe
        const earnings = await Transaction.aggregate([
            { $match: { type: 'purchase', status: 'success', createdAt: { $gte: dateLimit } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Calculate Gross Platform Profit: Revenue - Cost (only for successful data orders)
        const orderData = await Order.aggregate([
            { $match: { 
                status: 'completed', 
                createdAt: { $gte: dateLimit } 
            } },
            { $group: { 
                _id: null, 
                revenue: { $sum: '$amount' },
                cost: { $sum: '$cost' }
            } }
        ]);
        const grossProfit = (orderData[0]?.revenue || 0) - (orderData[0]?.cost || 0);

        // Calculate Agent Store Profit: Sum of all profits in the Profit model within timeframe
        const ProfitModel = require('../models/Profit');
        const agentStoreProfits = await ProfitModel.aggregate([
            { $match: { createdAt: { $gte: dateLimit } } },
            { $lookup: { from: 'users', localField: 'agent', foreignField: '_id', as: 'agentUser' } },
            { $unwind: '$agentUser' },
            { $match: { 'agentUser.role': { $ne: 'admin' } } },
            { $group: { _id: null, total: { $sum: '$profit' } } }
        ]);
        const storeProfits = agentStoreProfits[0]?.total || 0;

        // Calculate Referral Commissions paid out in timeframe (excluding admins)
        const referralCommissions = await Transaction.aggregate([
            { $match: { 
                type: 'deposit', 
                status: 'success', 
                description: { $regex: /Referral Commission/i },
                createdAt: { $gte: dateLimit } 
            } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'theUser' } },
            { $unwind: '$theUser' },
            { $match: { 'theUser.role': { $ne: 'admin' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const refComms = referralCommissions[0]?.total || 0;

        const totalAgentProfit = storeProfits + refComms;
        const netAdminProfit = grossProfit - totalAgentProfit;

        // Calculate total funds currently available for withdrawal by agents
        const agentBalanceData = await User.aggregate([
            { $group: { 
                _id: null, 
                commissions: { $sum: '$commissionBalance' },
                referrals: { $sum: '$referralBalance' }
            } }
        ]);
        const totalOwedToAgents = (agentBalanceData[0]?.commissions || 0) + (agentBalanceData[0]?.referrals || 0);

        // Get Bossu API balance
        let apiBalance = 0;
        try {
            const bParams = new URLSearchParams();
            bParams.append('action', 'balance');
            
            const apiRes = await axios.post(process.env.BOSSU_API_URL, bParams, {
                headers: { 
                    'X-API-Key': process.env.BOSSU_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            apiBalance = apiRes.data.balance || 
                         apiRes.data.data?.balance || 
                         apiRes.data.wallet_balance || 
                         apiRes.data.data?.wallet_balance || 
                         apiRes.data.user_balance || 0;
        } catch (e) {
            console.error('API Balance fetch failed', e.message);
        }

        res.json({
            totalUsers,
            totalAgents,
            totalOrders,
            totalWalletBalance: walletTotals[0]?.total || 0,
            totalEarnings: earnings[0]?.total || 0, // Revenue in timeframe
            adminProfit: Number(netAdminProfit.toFixed(2)),
            agentProfit: Number(totalAgentProfit.toFixed(2)),
            totalOwedToAgents: Number(totalOwedToAgents.toFixed(2)),
            apiBalance,
            timeframe
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Manage Users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        
        // Parallelly fetch total spent for each user
        const usersWithStats = await Promise.all(users.map(async (u) => {
            const spentData = await Order.aggregate([
                { $match: { user: u._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            return {
                ...u,
                totalSpent: spentData[0]?.total || 0
            };
        }));

        res.json(usersWithStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.post('/user-block/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

router.post('/user-role/:id', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = role;
            await user.save();
        }
        res.json({ role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Error updating role' });
    }
});

router.post('/user-balance/:id', adminAuth, async (req, res) => {
    try {
        const { amount, action } = req.body; // action: 'add' or 'subtract'
        const user = await User.findById(req.params.id);
        if (action === 'add') user.balance += Number(amount);
        else user.balance -= Number(amount);
        await user.save();
        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: 'Error updating balance' });
    }
});

// Manage Pricing
router.get('/pricing', adminAuth, async (req, res) => {
    try {
        const pricing = await Pricing.find();
        res.json(pricing);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pricing' });
    }
});

router.post('/pricing', adminAuth, async (req, res) => {
    try {
        console.log('Admin Received Pricing Request:', JSON.stringify(req.body));
        const { network, packageKey, normalPrice, retailPrice } = req.body;
        const net = network.toString().toLowerCase();
        const pKey = packageKey.toString().trim().toLowerCase();
        console.log(`ADMIN SAVE: Standardizing Pricing for Network=${net}, PackageKey=${pKey}`);

        const updatedPricing = await Pricing.findOneAndUpdate(
            { network: net, packageKey: pKey },
            { 
                normalPrice: Number(normalPrice), 
                retailPrice: Number(retailPrice),
                updatedAt: Date.now() 
            },
            { upsert: true, new: true, runValidators: true }
        );
        
        console.log(`ADMIN SAVE: SUCCESS for ${net}/${pKey}. Result:`, JSON.stringify(updatedPricing));
        res.json(updatedPricing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving pricing' });
    }
});

// View All Transactions
router.get('/transactions', adminAuth, async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// View All Orders
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Sync all pending orders with Bossu API
const { syncAllPendingOrders } = require('../utils/orderSyncer');
router.post('/sync-orders', adminAuth, async (req, res) => {
    try {
        const result = await syncAllPendingOrders();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error syncing orders' });
    }
});

// View Reported Orders only
router.get('/reported-orders', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find({ isReported: true }).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reported orders' });
    }
});

// Resolve / dismiss a reported order
router.post('/resolve-report/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { action } = req.body; // 'refund' or 'dismiss'

        if (action === 'refund' && order.user) {
            const User = require('../models/User');
            const user = await User.findById(order.user._id || order.user);
            if (user) {
                user.balance += order.amount;
                await user.save();

                const Transaction = require('../models/Transaction');
                await Transaction.create({
                    user: user._id,
                    type: 'deposit',
                    amount: order.amount,
                    status: 'success',
                    reference: `REFUND_${order.externalReference}`,
                    description: `Admin Refund: ${order.network.toUpperCase()} ${order.packageName}`,
                    balanceBefore: user.balance - order.amount,
                    balanceAfter: user.balance
                });
            }
        }

        order.isReported = false;
        order.reportReason = '';
        order.status = action === 'refund' ? 'failed' : order.status;
        await order.save();

        res.json({ message: `Report ${action === 'refund' ? 'resolved with refund' : 'dismissed'}.`, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resolving report' });
    }
});

// Manage Withdrawals
const Withdrawal = require('../models/Withdrawal');

router.get('/withdrawals', adminAuth, async (req, res) => {
    try {
        const list = await Withdrawal.find().populate('user', 'name email commissionBalance').sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching withdrawals' });
    }
});

router.post('/resolve-withdrawal/:id', adminAuth, async (req, res) => {
    try {
        const { action, note } = req.body; // 'approved' or 'rejected'
        const w = await Withdrawal.findById(req.params.id);
        if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
        if (w.status !== 'pending') return res.status(400).json({ message: 'Withdrawal already processed' });

        if (action === 'rejected') {
            // Restore commission balance to user
            const user = await User.findById(w.user);
            if (user) {
                user.commissionBalance = Number((user.commissionBalance + w.amount).toFixed(2));
                await user.save();
            }
        }

        w.status = action;
        w.adminNote = note || '';
        w.updatedAt = Date.now();
        await w.save();

        res.json({ message: `Withdrawal ${action} successfully`, withdrawal: w });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resolving withdrawal' });
    }
});

// Manage Stores (Agent Links)
const Store = require('../models/Store');

router.get('/stores', adminAuth, async (req, res) => {
    try {
        const stores = await Store.find().populate('agent', 'name email commissionBalance').sort({ createdAt: -1 });
        res.json(stores);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stores' });
    }
});

router.post('/store-status/:id', adminAuth, async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) return res.status(404).json({ message: 'Store not found' });
        
        store.isActive = !store.isActive;
        await store.save();
        res.json({ message: `Store ${store.isActive ? 'activated' : 'deactivated'}`, isActive: store.isActive });
    } catch (err) {
        res.status(500).json({ message: 'Error updating store status' });
    }
});

// ─── PLATFORM SETTINGS ────────────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

router.post('/settings', adminAuth, async (req, res) => {
    try {
        const { globalNotification, deliveryStatus, communityLink, isMaintenanceMode } = req.body;
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        if (globalNotification !== undefined) settings.globalNotification = globalNotification;
        if (deliveryStatus !== undefined) settings.deliveryStatus = deliveryStatus;
        if (communityLink !== undefined) settings.communityLink = communityLink;
        if (isMaintenanceMode !== undefined) settings.isMaintenanceMode = isMaintenanceMode;
        
        settings.updatedAt = Date.now();
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Error updating settings' });
    }
});

// Business Analysis & Trends
router.get('/analysis', adminAuth, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Sales trend (Daily)
        const salesTrend = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                revenue: { $sum: "$amount" },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Service Distribution (API vs Store vs Dashboard)
        // Since many orders might not have 'source' field yet, we use a fallback based on externalReference prefix
        const sourceStats = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { 
                _id: { 
                    $cond: [
                        { $ifNull: ["$source", false] }, 
                        "$source", 
                        { $cond: [{ $regexMatch: { input: "$externalReference", regex: /^API-/i } }, "api", { $cond: [{ $regexMatch: { input: "$externalReference", regex: /^STORE_/i } }, "store", "dashboard"] }] }
                    ]
                },
                count: { $sum: 1 },
                revenue: { $sum: "$amount" }
            }}
        ]);

        // Network Distribution (Popularity)
        const networkStats = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { 
                _id: "$network", 
                count: { $sum: 1 },
                revenue: { $sum: "$amount" }
            }},
            { $sort: { count: -1 } }
        ]);

        // User growth trend
        const userTrend = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Top selling products (Packages)
        const topProducts = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { 
                _id: { network: "$network", name: "$packageName" }, 
                count: { $sum: 1 },
                revenue: { $sum: "$amount" }
            }},
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        // Top Spending Users
        const topUsers = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { 
                _id: "$user", 
                totalSpent: { $sum: "$amount" },
                orderCount: { $sum: 1 }
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
            { $unwind: "$userDetails" },
            { $project: { name: "$userDetails.name", email: "$userDetails.email", totalSpent: 1, orderCount: 1 } }
        ]);

        // Merchant Stats (Agents)
        const totalAgents = await User.countDocuments({ role: { $in: ['agent', 'store'] } });
        const newAgents = await User.countDocuments({ role: { $in: ['agent', 'store'] }, createdAt: { $gte: thirtyDaysAgo } });

        // Calculate Agent & Referral Profits for the last 30 days
        const ProfitModel = require('../models/Profit');
        const storeProfitsData = await ProfitModel.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $lookup: { from: 'users', localField: 'agent', foreignField: '_id', as: 'agentUser' } },
            { $unwind: '$agentUser' },
            { $match: { 'agentUser.role': { $ne: 'admin' } } },
            { $group: { _id: null, total: { $sum: '$profit' } } }
        ]);
        const thirtyDayStoreProfits = storeProfitsData[0]?.total || 0;

        const refCommsData = await Transaction.aggregate([
            { $match: { 
                type: 'deposit', 
                status: 'success', 
                description: { $regex: /Referral Commission/i },
                createdAt: { $gte: thirtyDaysAgo } 
            } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'theUser' } },
            { $unwind: '$theUser' },
            { $match: { 'theUser.role': { $ne: 'admin' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thirtyDayRefComms = refCommsData[0]?.total || 0;
        const thirtyDayAgentProfit = thirtyDayStoreProfits + thirtyDayRefComms;

        // Summary for AI/Chat Explanation
        const stats = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
                totalCost: { $sum: "$cost" },
                totalOrders: { $sum: 1 }
            }}
        ]);

        const grossProfit30 = (stats[0]?.totalRevenue || 0) - (stats[0]?.totalCost || 0);
        const netAdminProfit30 = grossProfit30 - thirtyDayAgentProfit;

        // Current liability (available for withdrawal)
        const agentBalances = await User.aggregate([
            { $group: { 
                _id: null, 
                total: { $sum: { $add: ["$commissionBalance", "$referralBalance"] } } 
            } }
        ]);

        const summary = {
            revenue: stats[0]?.totalRevenue || 0,
            profit: Number(netAdminProfit30.toFixed(2)),
            agentProfit: Number(thirtyDayAgentProfit.toFixed(2)),
            totalOwedToAgents: Number((agentBalances[0]?.total || 0).toFixed(2)),
            orders: stats[0]?.totalOrders || 0,
            avgOrderValue: stats[0]?.totalRevenue ? (stats[0].totalRevenue / stats[0].totalOrders) : 0,
            totalAgents,
            newAgents
        };

        res.json({ salesTrend, userTrend, topProducts, topUsers, summary, sourceStats, networkStats });
    } catch (err) {
        console.error('Analysis failed:', err);
        res.status(500).json({ message: 'Analysis failed' });
    }
});

// Google Gemini AI Assistant
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

router.post('/chat', adminAuth, async (req, res) => {
    try {
        const { message, history, context } = req.body; 
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `You are BrightData AI, the expert executive assistant for the BrightData Data & VTU platform.
        You assist the boss (admin) in managing the business. 
        Recent 30-day analytics context for your knowledge:
        - Total Revenue: ₵${context?.summary?.revenue || 0}
        - Admin Net Profit: ₵${context?.summary?.profit || 0}
        - Agent/Referral Paid: ₵${context?.summary?.agentProfit || 0}
        - Successful Orders: ${context?.summary?.orders || 0}
        - Total Scale: ${context?.summary?.totalAgents || 0} agents/users.
        
        Guidelines:
        1. Always greet the admin as 'Boss'.
        2. Stay professional, bold, and help drive business growth.
        3. Explain trends using the numbers provided above if asked.`;

        // Start chat with history
        const chat = model.startChat({
            history: (history || []).map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            }))
        });

        const prompt = `${systemPrompt}\n\nBoss says: ${message}`;
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (err) {
        console.error('Gemini AI Error:', err);
        res.status(500).json({ message: 'The Gemini assistant is having technical difficulties.' });
    }
});

module.exports = router;
