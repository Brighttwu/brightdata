const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'purchase', 'refund'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    reference: { type: String, unique: true },
    description: { type: String },
    balanceBefore: { type: Number },
    balanceAfter: { type: Number },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tracking who initialized this
    metadata: { type: Map, of: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
