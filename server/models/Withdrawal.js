const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['agent', 'referral'], default: 'agent' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    paymentMethod: { type: String, default: 'Mobile Money' },
    paymentDetails: { type: String, required: true }, // e.g., "MTN: 0244000000"
    adminNote: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
