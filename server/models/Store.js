const mongoose = require('mongoose');

const StorePricingSchema = new mongoose.Schema({
    packageKey: { type: String, required: true },
    packageName: { type: String },
    network: { type: String, required: true },
    price: { type: Number, required: true } // Store owner's selling price
}, { _id: false });

const StoreSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    whatsapp: { type: String, default: '' }, // e.g. 233241234567
    groupLink: { type: String, default: '' }, // WhatsApp Group Link
    logo: { type: String, default: '' }, // URL or base64
    theme: { type: String, enum: ['classic', 'modern', 'dark', 'sunset', 'eco', 'ocean', 'luxury'], default: 'classic' },
    customPrices: [StorePricingSchema],
    totalProfit: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', StoreSchema);
