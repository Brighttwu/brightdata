const mongoose = require('mongoose');

const SMMOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    link: { type: String, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    externalReference: { type: String, required: true, unique: true },
    orderId: { type: String }, // From SMM Provider API
    startCount: { type: Number, default: 0 },
    remains: { type: Number, default: 0 },
    apiResponse: { type: Object },
    customData: { type: String }, // For custom comments or specific service requirements
    refillable: { type: Boolean, default: false },
    averageTime: { type: String },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMMOrder', SMMOrderSchema);
