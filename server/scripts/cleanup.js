const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const spamKeywords = ['admin', 'users', 'administrator', 'victim', 'root', 'super admin', 'superadmin'];

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const query = {
            $or: [
                { name: { $in: spamKeywords.map(k => new RegExp(k, 'i')) } },
                { email: { $in: spamKeywords.map(k => new RegExp(k, 'i')) } }
            ],
            role: { $ne: 'admin' } // DO NOT DELETE ACTUAL ADMINS
        };

        const usersToDelete = await User.find(query);
        console.log(`Found ${usersToDelete.length} potential spam users.`);

        if (usersToDelete.length > 0) {
            const result = await User.deleteMany(query);
            console.log(`Successfully deleted ${result.deletedCount} spam users.`);
        } else {
            console.log('No spam users found matching criteria.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Cleanup failed:', err);
    }
}

cleanup();
