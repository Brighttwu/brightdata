require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const testEmail = `test_${Date.now()}@example.com`;
        const user = new User({
            name: 'Test User',
            email: testEmail,
            password: 'password123'
        });

        await user.save();
        console.log('SUCCESS: User saved to database!', testEmail);
        
        await User.deleteOne({ email: testEmail });
        console.log('Cleanup: Test user deleted.');
        
        process.exit(0);
    } catch (err) {
        console.error('DATABASE TEST FAILED:', err);
        process.exit(1);
    }
};

test();
