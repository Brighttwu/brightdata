const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const Store = require('../models/Store');
const Profit = require('../models/Profit');
const axios = require('axios');
const { handleReferralCommission } = require('./referralHelper');
const { verifyPaystackTransaction } = require('./paystackHelper');

const API_KEY = process.env.BOSSU_API_KEY;
const API_URL = process.env.BOSSU_API_URL;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const pollPendingPayments = async () => {
    try {
        console.log('[POLLER] Checking for unverified payments...');
 
        // 1. Check Wallet Transactions (BH_)
        const pendingWallets = await Transaction.find({ 
            status: 'pending', 
            reference: { $regex: /^BH_/ },
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });
 
        for (const tx of pendingWallets) {
            await verifyWalletPayment(tx);
        }
 
        // 2. Check Data Orders (BD_PAY_)
        const pendingData = await Order.find({ 
            status: 'pending_payment',
            externalReference: { $regex: /^BD_PAY_/ }
        });
 
        for (const order of pendingData) {
            await verifyDataPayment(order);
        }
 
        // 3. Check Store Orders (STORE_)
        const pendingStores = await Order.find({ 
            status: 'pending_payment',
            externalReference: { $regex: /^STORE_/ }
        });
 
        for (const order of pendingStores) {
            await verifyStorePayment(order);
        }

        // 4. RETRY orders stuck due to low API balance
        const awaitingBalanceOrders = await Order.find({ status: 'awaiting_api_balance' });
        if (awaitingBalanceOrders.length > 0) {
            console.log(`[POLLER] Found ${awaitingBalanceOrders.length} orders awaiting API balance. Checking API funds...`);
            
            // Check API balance first
            const balParams = new URLSearchParams({ action: 'balance' });
            const balRes = await axios.post(API_URL, balParams, {
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const apiBalance = Number(balRes.data.balance || balRes.data.data?.balance || 0);
            
            if (apiBalance > 10) { // Small threshold to avoid immediate re-failure
                console.log(`[POLLER] API Balance is ₵${apiBalance}. Retrying orders...`);
                for (const order of awaitingBalanceOrders) {
                    await retryAwaitingOrder(order);
                }
            } else {
                console.log(`[POLLER] API Balance still low (₵${apiBalance}). Skipping retry.`);
            }
        }
 
    } catch (err) {
        console.error('[POLLER ERROR]:', err.message);
    }
};

async function retryAwaitingOrder(order) {
    try {
        console.log(`[POLLER] Retrying Order: ${order.externalReference}`);
        const buyParams = new URLSearchParams({
            action: 'create_order', network: order.network, package_key: order.packageKey,
            recipient_phone: order.phoneNumber, external_reference: order.externalReference
        });
        const bossuRes = await axios.post(API_URL, buyParams, {
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const bossuData = bossuRes.data.data || bossuRes.data;
        const apiMsg = (bossuRes.data.message || bossuData.message || "").toLowerCase();
        const isStillLowBalance = apiMsg.includes('insufficient') || apiMsg.includes('balance');

        if (bossuRes.data.success !== false && !isStillLowBalance && bossuData.status !== 'failed') {
            order.orderId = bossuData.order_id;
            order.apiResponse = bossuRes.data;
            order.status = 'pending';
            await order.save();
            console.log(`[POLLER] Retry Successful: ${order.externalReference}`);
        } else {
            console.log(`[POLLER] Retry failed again for ${order.externalReference}: ${apiMsg}`);
        }
    } catch (e) {
        console.error(`[POLLER] Retry error for ${order.externalReference}:`, e.message);
    }
}

async function verifyWalletPayment(tx) {
    try {
        const data = await verifyPaystackTransaction(tx.reference);
        if (data) {
            const user = await User.findById(tx.user);
            const user = await User.findById(tx.user);
            if (!user) return;

            // Amount check
            const paid = data.amount / 100;
            if (paid < tx.amount * 0.95) {
                tx.status = 'failed';
                await tx.save();
                return;
            }

            user.balance += tx.amount;
            await user.save();

            tx.status = 'success';
            tx.balanceAfter = user.balance;
            await tx.save();
            console.log(`[POLLER] Verified Wallet: ${tx.reference}`);
        }
    } catch (e) {
        // Skip on error (maybe Paystack is down or ref is truly invalid)
    }
}

async function verifyDataPayment(order) {
    try {
        const data = await verifyPaystackTransaction(order.externalReference);
        if (data) {
            const paid = data.amount / 100;
            if (paid < order.amount * 0.95) {
                order.status = 'failed';
                await order.save();
                return;
            }

            // Fulfill via Bossu
            const buyParams = new URLSearchParams({
                action: 'create_order', network: order.network, package_key: order.packageKey,
                recipient_phone: order.phoneNumber, external_reference: order.externalReference
            });
            const bossuRes = await axios.post(API_URL, buyParams, {
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const bossuData = bossuRes.data.data || bossuRes.data;
            order.orderId = bossuData.order_id;
            order.apiResponse = bossuRes.data;
            
            const apiMsg = (bossuRes.data.message || bossuData.message || "").toLowerCase();
            const isLowBalance = apiMsg.includes('insufficient') || apiMsg.includes('balance');
            const isFailed = (bossuData.status === 'failed' || bossuRes.data.success === false);
            
            if (isFailed && isLowBalance) {
                order.status = 'failed';
            } else {
                order.status = isFailed ? 'failed' : 'pending';
            }
            
            const targetUser = await User.findById(order.user);
            
            await Transaction.create({
                user: targetUser._id, type: 'deposit', amount: order.amount, status: 'success',
                reference: `${order.externalReference}_dep`, description: `Auto-Poll Deposit for ${order.packageName}`,
                balanceBefore: targetUser.balance, balanceAfter: targetUser.balance + order.amount
            });

            if (isFailed && isLowBalance && targetUser) {
                // Refund to balance for poller failures too
                targetUser.balance += order.amount;
                await targetUser.save();
                await Transaction.create({
                    user: targetUser._id, type: 'deposit', amount: order.amount, status: 'success',
                    reference: `${order.externalReference}_ref`, description: `Refund (Poller): Insufficient API Balance`,
                    balanceBefore: targetUser.balance - order.amount, balanceAfter: targetUser.balance
                });
            } else {
                await Transaction.create({
                    user: targetUser._id, type: 'purchase', amount: order.amount, status: isFailed ? 'failed' : 'success',
                    reference: order.externalReference, description: `${order.network.toUpperCase()} ${order.packageName} - ${order.phoneNumber}`,
                    balanceBefore: targetUser.balance + order.amount, balanceAfter: isFailed ? targetUser.balance + order.amount : targetUser.balance
                });
            }

            await order.save();
            await handleReferralCommission(targetUser._id, order.amount, order.externalReference);
            console.log(`[POLLER] Verified Data: ${order.externalReference}`);
        }
    } catch (e) {}
}

async function verifyStorePayment(order) {
    try {
        const data = await verifyPaystackTransaction(order.externalReference);
        if (data) {
            const meta = data.metadata;
            const paid = data.amount / 100;
            
            if (!meta || !meta.storeId) return; // Meta missing, can't auto-verify store easily without it
            if (paid < order.amount * 0.95) {
                order.status = 'failed';
                await order.save();
                return;
            }

            const { storeId, agentId, network, packageKey, packageName, recipientPhone, sellingPrice, platformCost } = meta;

            const store = await Store.findById(storeId);
            const agent = await User.findById(agentId);
            if (!store || !agent) return;

            // Fulfill
            const buyParams = new URLSearchParams({
                action: 'create_order', network, package_key: packageKey,
                recipient_phone: recipientPhone, external_reference: order.externalReference
            });
            const bossuRes = await axios.post(API_URL, buyParams, {
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const bossuData = bossuRes.data.data || bossuRes.data;
            order.orderId = bossuData.order_id || bossuRes.data?.order_id;
            order.apiResponse = bossuRes.data;
            
            const apiMsg = (bossuRes.data.message || bossuData.message || "").toLowerCase();
            const isLowBalance = apiMsg.includes('insufficient') || apiMsg.includes('balance');
            
            if (bossuRes.data.success === false && isLowBalance) {
                order.status = 'awaiting_api_balance';
            } else {
                order.status = (bossuRes.data.success === false) ? 'failed' : 'pending';
            }
            await order.save();

            // Commission
            const profit = Number((sellingPrice - platformCost).toFixed(2));
            if (profit > 0) {
                agent.commissionBalance = Number((agent.commissionBalance + profit).toFixed(2));
                await agent.save();
                await Transaction.create({
                    user: agentId, type: 'deposit', amount: profit, status: 'success',
                    reference: `PROFIT_${order.externalReference}`,
                    description: `Commission: ${network.toUpperCase()} ${packageName} → ${recipientPhone}`,
                    balanceBefore: agent.balance, balanceAfter: agent.balance
                });
            }

            await Profit.create({
                agent: agentId, store: storeId, order: order._id, customerPhone: recipientPhone,
                network, packageName, salePrice: sellingPrice, agentCost: platformCost, profit
            });

            store.totalProfit = Number(((store.totalProfit || 0) + profit).toFixed(2));
            store.totalSales = (store.totalSales || 0) + 1;
            await store.save();

            await handleReferralCommission(agentId, sellingPrice, order.externalReference);
            console.log(`[POLLER] Verified Store order: ${order.externalReference}`);
        }
    } catch (e) {}
}

module.exports = { pollPendingPayments };
