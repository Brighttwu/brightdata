const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Store = require('../models/Store');
const Profit = require('../models/Profit');
const { handleReferralCommission } = require('../utils/referralHelper');

const API_KEY = process.env.BOSSU_API_KEY;
const API_URL = process.env.BOSSU_API_URL;

router.post('/', async (req, res) => {
    try {
        // 1. Verify Paystack Signature
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
        
        if (hash !== req.headers['x-paystack-signature']) {
            console.error('[Paystack Webhook] Invalid signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;
        console.log(`[Paystack Webhook] Received event: ${event.event}`);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const amountPaidGHS = data.amount / 100;
            const metadata = data.metadata || {};

            console.log(`[Paystack Webhook] Processing success for reference: ${reference}`);

            // A. WALLET TOP-UP (BH_ prefix)
            if (reference.startsWith('BH_')) {
                const transaction = await Transaction.findOne({ reference });
                if (!transaction) {
                    console.error(`[Paystack Webhook] Wallet transaction not found for ref: ${reference}`);
                    return res.status(200).send('Event received but record missing');
                }

                if (transaction.status === 'success') {
                    console.log(`[Paystack Webhook] Wallet transaction already success: ${reference}`);
                    return res.status(200).send('Already processed');
                }

                // Amount validation: ensure Paystack received enough
                if (amountPaidGHS < transaction.amount * 0.95) {
                    transaction.status = 'failed';
                    await transaction.save();
                    console.error(`[Paystack Webhook] Amount mismatch for wallet refill: ${reference}`);
                    return res.status(200).send('Amount mismatch');
                }

                const user = await User.findById(transaction.user);
                if (!user) {
                    console.error(`[Paystack Webhook] User not found for wallet refill: ${transaction.user}`);
                    return res.status(200).send('User not found');
                }

                // Balance adjustment
                const balanceBefore = user.balance;
                user.balance += transaction.amount;
                await user.save();

                transaction.status = 'success';
                transaction.balanceAfter = user.balance;
                await transaction.save();

                console.log(`[Paystack Webhook] Wallet refilled for ${user.email}. New balance: ${user.balance}`);
            }

            // B. DIRECT DATA PURCHASE (BD_PAY_ prefix or type=data)
            else if (reference.startsWith('BD_PAY_')) {
                const order = await Order.findOne({ externalReference: reference });
                if (!order) {
                    console.error(`[Paystack Webhook] Data order not found for ref: ${reference}`);
                    return res.status(200).send('Order not found');
                }

                if (order.status !== 'pending_payment') {
                    console.log(`[Paystack Webhook] Data order already processed: ${reference}`);
                    return res.status(200).send('Already processed');
                }

                // Call Bossu API
                try {
                    const buyParams = new URLSearchParams({
                        action: 'create_order',
                        network: order.network,
                        package_key: order.packageKey,
                        recipient_phone: order.phoneNumber,
                        external_reference: reference
                    });
                    const bossuRes = await axios.post(API_URL, buyParams, {
                        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    const bossuData = bossuRes.data.data || bossuRes.data;
                    order.orderId = bossuData.order_id;
                    order.apiResponse = bossuRes.data;
                    
                    const apiMsg = (bossuRes.data.message || bossuData.message || "").toLowerCase();
                    const isLowBalance = apiMsg.includes('insufficient') || apiMsg.includes('balance');
                    
                    if (bossuRes.data.success === false && isLowBalance) {
                        order.status = 'awaiting_api_balance';
                    } else {
                        order.status = (bossuData.status === 'failed' || bossuRes.data.success === false) ? 'failed' : 'pending';
                    }
                    
                    const targetUser = await User.findById(order.user);
                    const isFailed = order.status === 'failed';
                    
                    // Create transaction records
                    await Transaction.create({
                        user: targetUser._id,
                        type: 'deposit',
                        amount: order.amount,
                        status: 'success',
                        reference: `${reference}_dep`,
                        description: `Paystack Deposit for ${order.packageName}`,
                        balanceBefore: targetUser.balance,
                        balanceAfter: targetUser.balance + order.amount
                    });
                    await Transaction.create({
                        user: targetUser._id,
                        type: 'purchase',
                        amount: order.amount,
                        status: isFailed ? 'failed' : 'success',
                        reference: reference,
                        description: `${order.network.toUpperCase()} ${order.packageName} - ${order.phoneNumber}`,
                        balanceBefore: targetUser.balance + order.amount,
                        balanceAfter: isFailed ? targetUser.balance + order.amount : targetUser.balance
                    });

                    await order.save();
                    await handleReferralCommission(targetUser._id, order.amount, reference);
                    console.log(`[Paystack Webhook] Data order provisioned: ${reference}`);
                } catch (err) {
                    console.error(`[Paystack Webhook] Bossu API Error: ${err.message}`);
                    // Order stays in pending_payment or we mark as error? 
                    // Let's keep it robust. If it failed at API level, we should mark as failed.
                    order.status = 'failed';
                    order.apiResponse = { error: err.message };
                    await order.save();
                }
            }

            // C. STORE PURCHASE (STORE_ prefix or metadata.type=store_purchase)
            else if (reference.startsWith('STORE_') || metadata.type === 'store_purchase') {
                const existingOrder = await Order.findOne({ externalReference: reference });
                if (existingOrder && existingOrder.status !== 'pending_payment') {
                    console.log(`[Paystack Webhook] Store order already processed: ${reference}`);
                    return res.status(200).send('Already processed');
                }

                const { storeId, agentId, network, packageKey, packageName, recipientPhone, sellingPrice, platformCost } = metadata;
                
                // If metadata is missing but it's a STORE_ ref, we might have a problem if it wasn't saved.
                // But STORE_ refs always have metadata in initialize.
                if (!storeId || !agentId) {
                    console.error(`[Paystack Webhook] Store metadata missing for ref: ${reference}`);
                    return res.status(200).send('Metadata missing');
                }

                const store = await Store.findById(storeId);
                const agent = await User.findById(agentId);
                if (!store || !agent) {
                    console.error(`[Paystack Webhook] Store or agent not found for ref: ${reference}`);
                    return res.status(200).send('Store/Agent not found');
                }

                // 1. Order Record
                let order;
                if (existingOrder) {
                    order = existingOrder;
                    order.status = 'pending';
                } else {
                    order = await Order.create({
                        user: agentId, network, packageKey, packageName,
                        phoneNumber: recipientPhone, amount: sellingPrice,
                        externalReference: reference, status: 'pending'
                    });
                }

                // 2. Bossu API
                let bossuOrderId = null;
                let bossuStatus = 'pending';
                let bossuApiResponse = null;

                try {
                    const buyParams = new URLSearchParams({
                        action: 'create_order', network, package_key: packageKey,
                        recipient_phone: recipientPhone, external_reference: reference
                    });
                    const bossuRes = await axios.post(API_URL, buyParams, {
                        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
                    bossuApiResponse = bossuRes.data;
                    const bossuData = bossuRes.data.data || bossuRes.data;
                    bossuOrderId = bossuData.order_id;
                    
                    const apiMsg = (bossuRes.data.message || bossuData.message || "").toLowerCase();
                    if (bossuRes.data.success === false && (apiMsg.includes('insufficient') || apiMsg.includes('balance'))) {
                        bossuStatus = 'awaiting_api_balance';
                    } else if (bossuData.status === 'failed' || bossuRes.data.success === false) {
                        bossuStatus = 'failed';
                    }
                } catch (bossuErr) {
                    console.error('[Paystack Webhook] Bossu API Error (Store):', bossuErr.message);
                    bossuStatus = 'failed';
                    bossuApiResponse = { error: bossuErr.message };
                }

                order.orderId = bossuOrderId;
                order.apiResponse = bossuApiResponse;
                order.status = bossuStatus;
                await order.save();

                // 3. Commission
                const profit = Number((sellingPrice - platformCost).toFixed(2));
                if (profit > 0) {
                    agent.commissionBalance = Number((agent.commissionBalance + profit).toFixed(2));
                    await agent.save();

                    await Transaction.create({
                        user: agentId, type: 'deposit', amount: profit, status: 'success',
                        reference: `PROFIT_${reference}`,
                        description: `Commission: ${network.toUpperCase()} ${packageName} → ${recipientPhone}`,
                        balanceBefore: agent.balance, balanceAfter: agent.balance
                    });
                }

                // 4. Logs
                await Profit.create({
                    agent: agentId, store: storeId, order: order._id, customerPhone: recipientPhone,
                    network, packageName, salePrice: sellingPrice, agentCost: platformCost, profit
                });

                store.totalProfit = Number(((store.totalProfit || 0) + profit).toFixed(2));
                store.totalSales = (store.totalSales || 0) + 1;
                await store.save();

                await handleReferralCommission(agentId, sellingPrice, reference);
                console.log(`[Paystack Webhook] Store order processed: ${reference}`);
            }
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('[Paystack Webhook] Critical Error:', err.message);
        res.status(500).send('Webhook Processing Error');
    }
});

module.exports = router;
