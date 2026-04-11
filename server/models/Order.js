const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    network: { type: String, required: true },
    packageKey: { type: String, required: true },
    packageName: { type: String },
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending_payment', 'pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
    externalReference: { type: String, required: true, unique: true },
    orderId: { type: String }, // From Bossu API
    apiResponse: { type: Object },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
