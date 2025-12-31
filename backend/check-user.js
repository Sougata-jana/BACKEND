import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUser = async (emailOrUsername) => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const users = await User.find({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        }).select('username email isAdmin fullname');

        if (users.length === 0) {
            console.log(`❌ No user found with email/username: ${emailOrUsername}`);
        } else {
            console.log(`✅ Found ${users.length} user(s):\n`);
            users.forEach((user, index) => {
                console.log(`User ${index + 1}:`);
                console.log(`  Username: ${user.username}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Full Name: ${user.fullname}`);
                console.log(`  Is Admin: ${user.isAdmin}`);
                console.log(`  ID: ${user._id}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const emailOrUsername = process.argv[2] || 'janasougata198@gmail.com';
checkUser(emailOrUsername);
