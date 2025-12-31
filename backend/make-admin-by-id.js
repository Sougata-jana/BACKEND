import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const makeUserAdminById = async (userId) => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        if (!mongoUri) {
            console.error('MongoDB URI not found in environment variables');
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Convert string to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        const user = await User.findById(objectId);

        if (!user) {
            console.error(`User not found with ID: ${userId}`);
            process.exit(1);
        }

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

const userId = process.argv[2];

if (!userId) {
    console.error('Please provide user ID as argument');
    console.log('Usage: node make-admin-by-id.js <user-id>');
    process.exit(1);
}

makeUserAdminById(userId);
