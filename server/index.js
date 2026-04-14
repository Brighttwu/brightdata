require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
    process.env.ADMIN_URL ? process.env.ADMIN_URL.replace(/\/$/, '') : null
].filter(Boolean);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging Middleware (Must be before routes)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables!');
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas'))
    .catch(err => {
        console.error('CRITICAL: MongoDB Connection Failed!');
        console.error('Error Details:', err.message);
    });

// Health & Status Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
// Webhook route must be registered before express.json() if raw body is needed, 
// but here we register it to ensure reliable payment processing.
app.use('/api/paystack-webhook', require('./routes/paystackWebhook'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));

app.get('/', (req, res) => res.send('brightdata API Running'));

// Background Task: Auto-Sync Orders every 20 seconds
const { syncAllPendingOrders } = require('./utils/orderSyncer');
const { pollPendingPayments } = require('./utils/paymentPoller');

setInterval(async () => {
    try {
        await syncAllPendingOrders();
    } catch (e) {
        console.error('Background Sync Error:', e.message);
    }
}, 20000); // 20 seconds

setInterval(async () => {
    try {
        await pollPendingPayments();
    } catch (e) {
        console.error('Background Payment Poller Error:', e.message);
    }
}, 20000); // 20 seconds

// Global Error Handler (Must be after routes)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack || err);
    res.status(500).json({ 
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- Automated Order Sync Active (Every 20s) ---');
});
