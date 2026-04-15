const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 }, // For Agents
    referralBalance: { type: Number, default: 0 }, // For Referrals
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    momoNumber: { type: String }, // For withdrawals
    role: { type: String, enum: ['user', 'admin', 'agent', 'store'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
    resetOtp: { type: String },
    resetOtpExpire: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Generate Referral Code on creation if not exists
UserSchema.pre('validate', async function() {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
