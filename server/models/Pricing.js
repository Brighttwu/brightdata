const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
    network: { type: String, required: true },
    packageKey: { type: String, required: true },
    normalPrice: { type: Number, default: 0 },
    retailPrice: { type: Number, default: 0 }, // For Store & Agent
    updatedAt: { type: Date, default: Date.now }
});

// Compound unique index
PricingSchema.index({ network: 1, packageKey: 1 }, { unique: true });

module.exports = mongoose.model('Pricing', PricingSchema);
