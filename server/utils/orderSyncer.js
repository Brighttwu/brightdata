const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

const syncAllPendingOrders = async () => {
    try {
        const pendingOrders = await Order.find({ status: 'pending' });
        if (pendingOrders.length === 0) return { message: 'No pending orders', updatedCount: 0 };

        console.log(`[SYNC] Starting sync for ${pendingOrders.length} orders...`);
        let updatedCount = 0;

        for (const order of pendingOrders) {
            if (!order.orderId) continue;
            try {
                const sParams = new URLSearchParams();
                sParams.append('action', 'order_status');
                sParams.append('order_id', order.orderId.toString().trim());

                const response = await axios.post(process.env.BOSSU_API_URL, sParams, {
                    headers: { 
                        'X-API-Key': process.env.BOSSU_API_KEY,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000 // 10s timeout per request
                });

                const apiData = response.data;
                // Bossu API sometimes returns status in .data.status or directly in .status
                const apiStatus = apiData?.data?.status || apiData?.status;
                
                if (apiStatus) {
                    const statusMap = {
                        'completed': 'completed', 
                        'delivered': 'completed', 
                        'success': 'completed',
                        'failed': 'failed', 
                        'cancelled': 'cancelled',
                        'error': 'failed',
                        'pending': 'pending', 
                        'processing': 'pending'
                    };
                    const mappedStatus = statusMap[apiStatus.toLowerCase()] || order.status;
                    
                    if (mappedStatus !== order.status) {
                        console.log(`[SYNC] Order ${order.externalReference} changed: ${order.status} -> ${mappedStatus}`);
                        order.status = mappedStatus;
                        order.updatedAt = Date.now();
                        
                        if (mappedStatus === 'failed' || mappedStatus === 'cancelled') {
                            const user = await User.findById(order.user);
                            if (user) {
                                user.balance += order.amount;
                                await user.save();
                                
                                await Transaction.create({
                                    user: user._id,
                                    type: 'deposit',
                                    amount: order.amount,
                                    status: 'success',
                                    reference: `SYNC_REFUND_${order.externalReference}`,
                                    description: `Auto Sync Refund: ${order.network.toUpperCase()} ${order.packageName}`,
                                    balanceBefore: user.balance - order.amount,
                                    balanceAfter: user.balance
                                });
                                console.log(`[SYNC] Refunded user ${user.email} for failed order.`);
                            }
                        }
                        await order.save();
                        updatedCount++;
                    }
                }
            } catch (err) {
                console.error(`[SYNC ERROR] Order ${order.externalReference}:`, err.message);
            }
        }
        return { message: `Sync completed. ${updatedCount} orders updated.`, updatedCount };
    } catch (err) {
        console.error('[SYNC CRITICAL ERROR]:', err);
        return { message: 'Sync failed', error: err.message };
    }
};

module.exports = { syncAllPendingOrders };
