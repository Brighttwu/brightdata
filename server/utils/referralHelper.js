const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendReferralNotification } = require('./emailHelper');

const handleReferralCommission = async (buyerId, amount, orderRef) => {
    try {
        const buyer = await User.findById(buyerId).populate('referredBy');
        if (!buyer || !buyer.referredBy) return;

        const referrer = buyer.referredBy;
        const commission = Number((amount * 0.01).toFixed(2));

        if (commission <= 0) return;

        referrer.referralBalance = Number((referrer.referralBalance + commission).toFixed(2));
        await referrer.save();

        await Transaction.create({
            user: referrer._id,
            type: 'deposit',
            amount: commission,
            status: 'success',
            reference: `REF_${orderRef}`,
            description: `Referral Commission from ${buyer.name} (Order: ${orderRef})`,
            balanceBefore: referrer.balance,
            balanceAfter: referrer.balance // We don't touch main balance
        });

        // Notify Referrer via Email
        await sendReferralNotification(referrer.email, referrer.name, buyer.name, commission);

        console.log(`Referral Commission: ₵${commission} paid to ${referrer.name} for buyer ${buyer.name}`);
    } catch (err) {
        console.error('Referral Commission Error:', err);
    }
};

module.exports = { handleReferralCommission };
