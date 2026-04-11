const mongoose = require('mongoose');

const ProfitSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerPhone: { type: String },
    network: { type: String },
    packageName: { type: String },
    salePrice: { type: Number }, // what customer paid
    agentCost: { type: Number }, // what agent was charged (retail price)
    profit: { type: Number },   // salePrice - agentCost
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profit', ProfitSchema);
