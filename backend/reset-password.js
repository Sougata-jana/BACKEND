import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async (emailOrUsername, newPassword) => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        await mongoose.connect(`${mongoUri}/Youtube`);
        console.log('Connected to MongoDB (Youtube database)\n');

        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });

        if (!user) {
            console.error(`❌ User not found: ${emailOrUsername}`);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log('✅ Password updated successfully!');
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`New Password: ${newPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const emailOrUsername = process.argv[2];
const newPassword = process.argv[3];

if (!emailOrUsername || !newPassword) {
    console.error('Usage: node reset-password.js <email-or-username> <new-password>');
    process.exit(1);
}

resetPassword(emailOrUsername, newPassword);
