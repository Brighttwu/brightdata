const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    globalNotification: { type: String, default: 'Welcome to brightdata hub!' },
    deliveryStatus: { type: String, enum: ['fast', 'normal', 'slow'], default: 'fast' },
    whatsappNumber: { type: String, default: '233556460743' },
    isMaintenanceMode: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
