import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAllUsersWithEmailAdmin = async (email) => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        await mongoose.connect(`${mongoUri}/Youtube`);
        console.log('Connected to MongoDB (Youtube database)\n');

        const result = await User.updateMany(
            { email: email },
            { $set: { isAdmin: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} user(s) with email: ${email}`);
        console.log(`Total matched: ${result.matchedCount}`);

        // Show updated users
        const users = await User.find({ email: email }).select('username email isAdmin fullname');
        console.log('\nUpdated users:');
        users.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Full Name: ${user.fullname}`);
            console.log(`  Is Admin: ${user.isAdmin}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const email = process.argv[2] || 'janasougata198@gmail.com';
makeAllUsersWithEmailAdmin(email);
