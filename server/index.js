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

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables!');
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas'))
    .catch(err => {
        console.error('CRITICAL: MongoDB Connection Failed!');
        console.error('Error Details:', err.message);
        console.log('TIP: Check if MONGODB_URI starts with mongodb+srv:// and ensure your IP is whitelisted in Atlas.');
    });

// Health & Status Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));

app.get('/', (req, res) => res.send('brightdata API Running'));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
