const axios = require('axios');

/**
 * Verifies a transaction with Paystack API.
 * Returns the transaction data if successful, otherwise throws an error.
 */
const verifyPaystackTransaction = async (reference) => {
    if (!reference) throw new Error('No reference provided for verification');
    
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');

    try {
        console.log(`[PAYSTACK HELPER] Verifying reference: ${reference}`);
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/json'
            }
        });

        const { status, data, message } = response.data;

        if (status === true && data && data.status === 'success') {
            console.log(`[PAYSTACK HELPER] Verification Successful for ${reference}`);
            return data;
        } else {
            const errorMsg = data?.gateway_response || message || 'Transaction not successful';
            console.warn(`[PAYSTACK HELPER] Verification Failed for ${reference}: ${errorMsg}`);
            return null;
        }
    } catch (err) {
        const errorData = err.response?.data;
        console.error(`[PAYSTACK HELPER] API Error for ${reference}:`, errorData || err.message);
        throw new Error(errorData?.message || 'Paystack verification request failed');
    }
};

module.exports = { verifyPaystackTransaction };
