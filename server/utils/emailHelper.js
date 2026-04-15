const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_Tj6d9cB9_Kd8ShyyQqJzXkicuuoth6gzx');

const FROM_EMAIL = 'Bright Data <onboarding@resend.dev>'; // Should be updated with verified domain

/**
 * Send Password Reset OTP
 */
const sendOtpEmail = async (email, otp) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your Password Reset OTP - Bright Data',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p>This code expires in 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error('Email Error (OTP):', error);
        return false;
    }
};

/**
 * Notify Referrer of New Earnings
 */
const sendReferralNotification = async (email, name, buyerName, commission) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'New Referral Commission Received! 🎉',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Great news, ${name}!</h2>
                    <p>A user you referred, <b>${buyerName}</b>, just made a purchase.</p>
                    <p>You have been credited with a commission of <b>₵${commission.toFixed(2)}</b> to your referral balance.</p>
                    <p>Keep referring to earn more!</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Email Error (Referral):', error);
    }
};

/**
 * Notify Store Owner of New Order
 */
const sendStoreOrderNotification = async (email, name, orderDetails) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'New Order in Your Store! 🛒',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Hello ${name},</h2>
                    <p>You have received a new order on your automated store.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><b>Package:</b> ${orderDetails.network.toUpperCase()} ${orderDetails.packageName}</p>
                        <p><b>Recipient:</b> ${orderDetails.recipientPhone}</p>
                        <p><b>Profit Earned:</b> ₵${orderDetails.profit.toFixed(2)}</p>
                    </div>
                    <p>The order is being processed automatically.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Email Error (Store Order):', error);
    }
};

/**
 * Notify Admin of Insufficient API Balance
 */
const sendAdminFundAlert = async (apiName, currentBalance) => {
    try {
        // Find admin email or use env
        const adminEmail = process.env.ADMIN_EMAIL || 'brightdatahub@gmail.com'; 
        
        await resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: '⚠ URGENT: Insufficient API Funds!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid red;">
                    <h2 style="color: red;">CRITICAL: API Funds Empty</h2>
                    <p>The system failed to fulfill an order because the vendor API (<b>${apiName}</b>) balance is too low.</p>
                    <p>Please top up your vendor account immediately to resume sales.</p>
                    <hr />
                    <p>This alert was triggered automatically by the system fulfillment monitor.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Email Error (Admin Alert):', error);
    }
};

module.exports = {
    sendOtpEmail,
    sendReferralNotification,
    sendStoreOrderNotification,
    sendAdminFundAlert
};
