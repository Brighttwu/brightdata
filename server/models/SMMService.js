const mongoose = require('mongoose');

const SMMServiceSchema = new mongoose.Schema({
    service: { type: String, required: true, unique: true }, // The ID from the SMM provider
    name: { type: String, required: true },
    category: { type: String, required: true },
    rate: { type: Number, required: true }, // Cost from API
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    averageTime: { type: String },
    description: { type: String },
    refill: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMMService', SMMServiceSchema);
