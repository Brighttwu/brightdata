const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_Tj6d9cB9_Kd8ShyyQqJzXkicuuoth6gzx');

const FROM_EMAIL = 'Bright Data <onboarding@brightdatahub.store>'; // Updated to verified domain

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

/**
 * Notify Admin of New Withdrawal Request
 */
const sendWithdrawalAlert = async (userName, withdrawalDetails) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'brightdatahub@gmail.com'; 
        
        await resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: '💸 New Withdrawal Request Received!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">New Payout Request</h2>
                    <p>A new withdrawal request has been submitted by <b>${userName}</b>.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                        <p><b>User:</b> ${userName}</p>
                        <p><b>Amount:</b> ₵${withdrawalDetails.amount.toFixed(2)}</p>
                        <p><b>Type:</b> ${withdrawalDetails.type.toUpperCase()}</p>
                        <p><b>Payment Details:</b> ${withdrawalDetails.paymentDetails}</p>
                        <p><b>Submitted:</b> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>Please log in to the admin dashboard to review and process this request.</p>
                    <hr />
                    <p style="font-size: 12px; color: #999;">Bright Data - Automated Payout Monitoring</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Email Error (Withdrawal Alert):', error);
    }
};

/**
 * Notify Admin of Reported Order
 */
const sendReportAlert = async (userName, order) => {
    try {
        const adminEmail = 'twumasibright966@gmail.com'; 
        
        await resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: '⚠ New Order Report Received!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #dc2626;">Order Report Alert</h2>
                    <p>User <b>${userName}</b> has reported an issue with an order.</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <p><b>Order Ref:</b> ${order.externalReference}</p>
                        <p><b>Package:</b> ${order.network.toUpperCase()} ${order.packageName}</p>
                        <p><b>Recipient Phone:</b> ${order.phoneNumber}</p>
                        <p><b>Amount Paid:</b> ₵${order.amount.toFixed(2)}</p>
                        <p><b>Order Time:</b> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p><b>Report Reason:</b> ${order.reportReason}</p>
                    </div>
                    <p>Please log in to the admin dashboard to investigate this claim.</p>
                    <hr />
                    <p style="font-size: 12px; color: #999;">Bright Data - Automated Order Support System</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Email Error (Report Alert):', error);
    }
};

module.exports = {
    sendOtpEmail,
    sendReferralNotification,
    sendStoreOrderNotification,
    sendAdminFundAlert,
    sendWithdrawalAlert,
    sendReportAlert
};
