const express = require('express');
const router = express.Router();
const axios = require('axios');
const Store = require('../models/Store');
const Profit = require('../models/Profit');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { handleReferralCommission } = require('../utils/referralHelper');

const API_URL = process.env.BOSSU_API_URL;
const API_KEY = process.env.BOSSU_API_KEY;
const AGENT_FEE = 40;

// ─── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id).then(user => {
            if (!user) return res.status(401).json({ message: 'User not found' });
            if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });
            req.user = user;
            next();
        }).catch(() => {
            res.status(401).json({ message: 'Token is not valid' });
        });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ─── BECOME AN AGENT ──────────────────────────────────────────────────────────
router.post('/upgrade', auth, async (req, res) => {
    try {
        const user = req.user;
        const existingStore = await Store.findOne({ agent: user._id });
        if ((['agent', 'store'].includes(user.role)) || (user.role === 'admin' && existingStore)) {
            return res.status(400).json({ message: 'Your merchant account is already active.' });
        }
        if (user.balance < AGENT_FEE) {
            return res.status(400).json({ message: `Insufficient balance. You need ₵${AGENT_FEE} to activate your store.` });
        }
        user.balance -= AGENT_FEE;
        if (user.role !== 'admin') user.role = 'agent';
        await user.save();
        await Transaction.create({
            user: user._id, type: 'purchase', amount: AGENT_FEE, status: 'success',
            reference: `AGENT_FEE_${Date.now()}`, description: 'Agent Upgrade Fee',
            balanceBefore: user.balance + AGENT_FEE, balanceAfter: user.balance
        });
        res.json({ message: 'Congratulations! You are now an agent.', user: { role: user.role, balance: user.balance } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error upgrading to agent' });
    }
});

// ─── GET MY STORE ─────────────────────────────────────────────────────────────
router.get('/my-store', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ agent: req.user._id });
        res.json(store || null);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching store' });
    }
});

// ─── CREATE / UPDATE STORE ────────────────────────────────────────────────────
router.post('/store', auth, async (req, res) => {
    try {
        const user = req.user;
        if (!['agent', 'store', 'admin'].includes(user.role)) {
            return res.status(403).json({ message: 'Only agents can create a store.' });
        }
        const { slug, name, description, whatsapp, groupLink, logo, theme } = req.body;
        if (!slug || !name) return res.status(400).json({ message: 'Store slug and name are required.' });
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').trim();
        const existing = await Store.findOne({ slug: cleanSlug, agent: { $ne: user._id } });
        if (existing) return res.status(400).json({ message: 'That store URL is already taken. Try another.' });
        const store = await Store.findOneAndUpdate(
            { agent: user._id },
            { slug: cleanSlug, name, description, whatsapp, groupLink, logo, theme, updatedAt: Date.now() },
            { upsert: true, new: true, runValidators: true }
        );
        if (user.role === 'agent') { user.role = 'store'; await user.save(); }
        res.json(store);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving store: ' + err.message });
    }
});

// ─── SET STORE CUSTOM PRICES ──────────────────────────────────────────────────
router.post('/store/prices', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ agent: req.user._id });
        if (!store) return res.status(404).json({ message: 'Store not found. Create your store first.' });

        const networkToSave = req.body.network;
        const incomingPrices = req.body.customPrices || [];

        // Server-side validation: selling price must be >= platform cost
        for (const cp of incomingPrices) {
            const net = cp.network.toLowerCase();
            const pKey = cp.packageKey.toString().trim().toLowerCase();

            // Fetch pricing rule to know platform cost (agent's cost)
            const rule = await Pricing.findOne({ network: { $regex: new RegExp(`^${net}$`, 'i') }, packageKey: { $regex: new RegExp(`^${pKey}$`, 'i') } });
            
            let platformCost = 0;
            if (rule) {
                if (rule.retailPrice > 0) platformCost = rule.retailPrice;
                else if (rule.normalPrice > 0) platformCost = rule.normalPrice;
            }
            if (platformCost === 0) {
                // Fetch from API if no rule
                const pkgParams = new URLSearchParams();
                pkgParams.append('action', 'packages');
                pkgParams.append('network', net);
                const response = await axios.post(API_URL, pkgParams, { headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } });
                const rawPackages = response.data.data || response.data.packages || [];
                const basePkg = rawPackages.find(p => (p.package_key || p.key || p.id || '').toString().trim().toLowerCase() === pKey);
                platformCost = basePkg ? Number(basePkg.price) : 0;
            }

            if (cp.price < platformCost) {
                return res.status(400).json({ message: `Price for ${cp.packageName} (₵${cp.price.toFixed(2)}) is too low. Minimum allowed is ₵${platformCost.toFixed(2)}.` });
            }
        }

        if (networkToSave) {
            // Keep prices for other networks, replace for the current one
            const otherPrices = store.customPrices.filter(cp => cp.network.toLowerCase() !== networkToSave.toLowerCase());
            store.customPrices = [...otherPrices, ...incomingPrices];
        } else {
            store.customPrices = incomingPrices;
        }

        store.updatedAt = Date.now();
        await store.save();
        res.json({ message: 'Prices updated!', store });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating prices' });
    }
});

// ─── GET AGENT DASHBOARD STATS ────────────────────────────────────────────────
router.get('/dashboard', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ agent: req.user._id });
        const profits = await Profit.find({ agent: req.user._id }).sort({ createdAt: -1 }).limit(50);
        const totalProfit = profits.reduce((sum, p) => sum + (p.profit || 0), 0);
        res.json({ store, profits, totalProfit, totalSales: profits.length });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard' });
    }
});

// ─── PUBLIC: GET STORE INFO ───────────────────────────────────────────────────
router.get('/public/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug.toLowerCase(), isActive: { $ne: false } });
        if (!store) return res.status(404).json({ message: 'Store not found' });
        res.json(store);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching store' });
    }
});

// ─── PUBLIC: GET STORE PACKAGES ───────────────────────────────────────────────
router.get('/public/:slug/packages/:network', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug.toLowerCase(), isActive: { $ne: false } });
        if (!store) return res.status(404).json({ message: 'Store not found' });
        const net = req.params.network.toLowerCase();
        const body = new URLSearchParams({ action: 'packages', network: net });
        const response = await axios.post(API_URL, body, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const rawPackages = response.data.data || response.data.packages || [];
        const pricings = await Pricing.find({ network: { $regex: new RegExp(`^${net}$`, 'i') } });

        const packages = rawPackages.map(p => {
            const pKey = (p.package_key || p.key || p.id || '').toString().trim().toLowerCase();
            const pKeyOriginal = (p.package_key || p.key || p.id || '').toString().trim();

            // Platform cost = retailPrice (what admin charges agents)
            const adminRule = pricings.find(x => (x.packageKey || '').toString().trim().toLowerCase() === pKey);
            let platformCost = Number(p.price);
            if (adminRule) {
                if (adminRule.retailPrice > 0) platformCost = adminRule.retailPrice;
                else if (adminRule.normalPrice > 0) platformCost = adminRule.normalPrice;
            }

            // Agent's selling price (their markup on top of platform cost)
            const storeRule = store.customPrices.find(x =>
                (x.packageKey || '').toString().trim().toLowerCase() === pKey &&
                (x.network || '').toLowerCase() === net
            );
            
            let sellingPrice = storeRule?.price > 0 ? storeRule.price : platformCost;
            let isPriceWarning = false;

            // Protection: If agent's price is lower than platform cost, use platform cost to avoid loss
            if (storeRule && storeRule.price > 0 && storeRule.price < platformCost) {
                sellingPrice = platformCost;
                isPriceWarning = true;
            }

            return {
                package_key: pKeyOriginal,
                display_name: p.display_name || p.name,
                price: Number(sellingPrice.toFixed(2)),
                platform_cost: Number(platformCost.toFixed(2)),
                network: net,
                isPriceWarning
            };
        }).sort((a, b) => a.price - b.price);

        res.json({ packages, store: { name: store.name, slug: store.slug } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching store packages' });
    }
});

// ─── PUBLIC: BUY FROM STORE (Commission Model) ────────────────────────────────
// Customer pays agent's selling price → Platform uses Bossu API to fulfill → Agent earns commission
router.post('/public/:slug/buy-init', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug.toLowerCase(), isActive: { $ne: false } }).populate('agent');
        if (!store) return res.status(404).json({ message: 'Store not found' });

        const { network, package_key, recipient_phone, customer_email } = req.body;
        if (!recipient_phone || !network || !package_key) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const net = network.toLowerCase();
        const pKey = package_key.toString().trim().toLowerCase();

        // Fetch packages from Bossu to get package details
        const body = new URLSearchParams({ action: 'packages', network: net });
        const pkgRes = await axios.post(API_URL, body, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const rawPkgs = pkgRes.data.data || pkgRes.data.packages || [];
        const basePkg = rawPkgs.find(p =>
            (p.package_key || p.key || p.id || '').toString().trim().toLowerCase() === pKey
        );
        if (!basePkg) return res.status(400).json({ message: 'Invalid package' });

        // Platform cost = admin's retailPrice for agents
        const pricings = await Pricing.find({ network: { $regex: new RegExp(`^${net}$`, 'i') } });
        const adminRule = pricings.find(x => (x.packageKey || '').toString().trim().toLowerCase() === pKey);
        let platformCost = Number(basePkg.price);
        if (adminRule) {
            if (adminRule.retailPrice > 0) platformCost = adminRule.retailPrice;
            else if (adminRule.normalPrice > 0) platformCost = adminRule.normalPrice;
        }

        // Agent's selling price
        const storeRule = store.customPrices.find(x =>
            (x.packageKey || '').toString().trim().toLowerCase() === pKey &&
            (x.network || '').toLowerCase() === net
        );
        let sellingPrice = storeRule?.price > 0 ? storeRule.price : platformCost;

        // SERVER-SIDE PRICE PROTECTION (Security + Loss Prevention)
        if (sellingPrice < platformCost) {
            sellingPrice = platformCost; // Fallback to avoid loss
        }

        // Initiate Paystack payment — customer pays agent's price
        const reference = `STORE_${store.slug}_${Date.now()}`;
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
        const paystackRes = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: customer_email || `guest_${Date.now()}@bossdata.store`,
            amount: Math.round(sellingPrice * 100), // in pesewas
            reference,
            callback_url: `${frontendUrl}/store/${store.slug}?reference=${reference}`,
            channels: ['card', 'mobile_money'],
            metadata: {
                type: 'store_purchase',
                storeSlug: store.slug,
                storeId: store._id.toString(),
                agentId: store.agent._id.toString(),
                network: net,
                packageKey: package_key,
                packageName: basePkg.display_name || basePkg.name,
                recipientPhone: recipient_phone,
                sellingPrice,
                platformCost
            }
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        res.json({ authorization_url: paystackRes.data.data.authorization_url, reference });
    } catch (err) {
        console.error('Store buy-init error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Error initiating payment' });
    }
});

// ─── STORE PAYSTACK VERIFY ────────────────────────────────────────────────────
// After customer pays: Platform places Bossu order, then credits commission to agent's wallet
router.get('/public/verify/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        // DUPLICATE PROTECTION: Check if this reference was already processed
        const existingOrder = await Order.findOne({ externalReference: reference });
        if (existingOrder) {
            return res.json({ message: 'This payment has already been processed.', orderId: existingOrder.orderId, profit: 0, status: existingOrder.status });
        }

        // PAYSTACK VERIFICATION: Always check with Paystack before crediting anything
        const psRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        if (psRes.data.data.status !== 'success') {
            return res.status(400).json({ message: 'Payment not successful. Paystack reported status: ' + psRes.data.data.status });
        }

        // Verify the amount paid matches what we expect (anti-tamper)
        const amountPaidGHS = psRes.data.data.amount / 100; // Paystack returns pesewas
        
        const meta = psRes.data.data.metadata;
        if (meta.type !== 'store_purchase') {
            return res.status(400).json({ message: 'Invalid payment type' });
        }

        const { storeId, agentId, network, packageKey, packageName, recipientPhone, sellingPrice, platformCost } = meta;

        // Verify the paid amount is sufficient (with 2% tolerance for Paystack fees)
        if (amountPaidGHS < sellingPrice * 0.95) {
            return res.status(400).json({ message: 'Payment amount mismatch. Expected ₵' + sellingPrice + ' but received ₵' + amountPaidGHS.toFixed(2) });
        }

        const store = await Store.findById(storeId);
        const agent = await User.findById(agentId);
        if (!store || !agent) return res.status(404).json({ message: 'Store or agent not found' });

        // 1. Initial Order Record (Pending Vendor)
        const order = await Order.create({
            user: agentId,
            network,
            packageKey,
            packageName,
            phoneNumber: recipientPhone,
            amount: sellingPrice,
            externalReference: reference,
            status: 'pending'
        });

        // 2. Platform places the Bossu order
        let bossuOrderId = null;
        let bossuStatus = 'pending';
        let bossuApiResponse = null;

        try {
            const buyParams = new URLSearchParams({
                action: 'create_order',
                network,
                package_key: packageKey,
                recipient_phone: recipientPhone,
                external_reference: reference
            });
            const bossuRes = await axios.post(API_URL, buyParams, {
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            bossuApiResponse = bossuRes.data;
            const bossuData = bossuRes.data.data || bossuRes.data;
            bossuOrderId = bossuData.order_id;
            
            if (bossuData.status === 'failed' || bossuRes.data.success === false) {
                bossuStatus = 'failed';
            }
        } catch (bossuErr) {
            console.error('Bossu API Call Failed for Store Purchase:', bossuErr.message);
            bossuStatus = 'failed';
            bossuApiResponse = { error: bossuErr.message, details: bossuErr.response?.data };
        }

        // 3. Update Order with API results
        order.orderId = bossuOrderId;
        order.apiResponse = bossuApiResponse;
        order.status = bossuStatus;
        await order.save();

        // 4. Credit agent's PROFIT commission
        const profit = Number((sellingPrice - platformCost).toFixed(2));
        if (profit > 0) {
            agent.commissionBalance = Number((agent.commissionBalance + profit).toFixed(2));
            await agent.save();

            await Transaction.create({
                user: agentId,
                type: 'deposit',
                amount: profit,
                status: 'success',
                reference: `PROFIT_${reference}`,
                description: `Commission: ${network.toUpperCase()} ${packageName} → ${recipientPhone}`,
                balanceBefore: agent.balance,
                balanceAfter: agent.balance
            });
        }

        // 5. Log profit record for dashboard
        await Profit.create({
            agent: agentId, store: storeId, order: order._id, customerPhone: recipientPhone,
            network, packageName, salePrice: sellingPrice, agentCost: platformCost, profit
        });

        // 6. Update store cumulative stats
        store.totalProfit = Number(((store.totalProfit || 0) + profit).toFixed(2));
        store.totalSales = (store.totalSales || 0) + 1;
        await store.save();

        // 7. Referral Commission
        try {
            await handleReferralCommission(agentId, sellingPrice, reference);
        } catch (refErr) {
            console.error('Referral Commission Error (Store):', refErr.message);
        }

        res.json({ message: 'Order processed!', orderId: bossuOrderId, profit, status: bossuStatus });
    } catch (err) {
        console.error('Store verify error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Error processing store purchase' });
    }
});

// ─── AGENT WITHDRAWAL REQUESTS ────────────────────────────────────────────────
const Withdrawal = require('../models/Withdrawal');

router.post('/request-withdrawal', auth, async (req, res) => {
    try {
        const { amount, paymentDetails } = req.body;
        const user = req.user;

        if (amount < 10) return res.status(400).json({ message: 'Minimum withdrawal is ₵10.00' });
        if (user.commissionBalance < amount) return res.status(400).json({ message: 'Insufficient commission balance' });

        // Deduct from commission balance immediately upon request
        user.commissionBalance = Number((user.commissionBalance - amount).toFixed(2));
        await user.save();

        const w = await Withdrawal.create({
            user: user._id,
            amount: Number(amount),
            type: 'agent',
            paymentDetails,
            status: 'pending'
        });

        res.json({ message: 'Withdrawal request submitted!', withdrawal: w, commissionBalance: user.commissionBalance });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting withdrawal' });
    }
});

// ─── REFERRAL SYSTEM ROUTES ───────────────────────────────────────────────────
router.get('/referral-stats', auth, async (req, res) => {
    try {
        const user = req.user;
        
        // Auto-generate for legacy users if missing
        if (!user.referralCode) {
            user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await user.save();
        }

        const referrals = await User.find({ referredBy: user._id }).select('name createdAt');
        res.json({
            referralCode: user.referralCode,
            referralBalance: user.referralBalance,
            referralCount: referrals.length,
            referrals
        });
    } catch (err) {
        console.error('Referral Stats Error:', err);
        res.status(500).json({ message: 'Error fetching referral stats' });
    }
});

router.post('/request-referral-withdrawal', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = req.user;

        if (amount < 10) return res.status(400).json({ message: 'Minimum withdrawal is ₵10.00' });
        if (user.referralBalance < amount) return res.status(400).json({ message: 'Insufficient referral balance' });
        if (!user.momoNumber) return res.status(400).json({ message: 'Please update your MoMo number in profile first' });

        // Deduct from referral balance
        user.referralBalance = Number((user.referralBalance - amount).toFixed(2));
        await user.save();

        const w = await Withdrawal.create({
            user: user._id,
            amount: Number(amount),
            type: 'referral',
            paymentDetails: `Referral Payout: ${user.momoNumber}`,
            status: 'pending'
        });

        res.json({ message: 'Referral withdrawal request submitted!', withdrawal: w, referralBalance: user.referralBalance });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting withdrawal' });
    }
});

module.exports = router;
