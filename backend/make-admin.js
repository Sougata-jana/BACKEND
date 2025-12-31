import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const makeUserAdmin = async (emailOrUsername) => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        if (!mongoUri) {
            console.error('MongoDB URI not found in environment variables');
            process.exit(1);
        }
        await mongoose.connect(`${mongoUri}/Youtube`);
        console.log('Connected to MongoDB (Youtube database)');

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });

        if (!user) {
            console.error(`User not found with email/username: ${emailOrUsername}`);
            process.exit(1);
        }

        // Update user to admin
        user.isAdmin = true;
        await user.save();

        console.log('✅ User updated successfully!');
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Is Admin: ${user.isAdmin}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Get email/username from command line argument
const emailOrUsername = process.argv[2];

if (!emailOrUsername) {
    console.error('Please provide email or username as argument');
    console.log('Usage: node make-admin.js <email-or-username>');
    process.exit(1);
}

makeUserAdmin(emailOrUsername);
