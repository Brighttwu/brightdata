const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: false 
    },
    image: {
        type: String,
        default: ''
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexing for faster queries
SupportMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);
