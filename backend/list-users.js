import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const listAllUsers = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        await mongoose.connect(`${mongoUri}/Youtube`);
        console.log('Connected to MongoDB (Youtube database)\n');

        const users = await User.find({}).select('username email isAdmin fullname createdAt');

        console.log(`✅ Found ${users.length} total user(s):\n`);
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Full Name: ${user.fullname}`);
            console.log(`  Is Admin: ${user.isAdmin ? '✅ YES' : '❌ NO'}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listAllUsers();
