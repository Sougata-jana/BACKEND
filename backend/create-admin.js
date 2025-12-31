import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    fullname: String,
    avatar: String,
    coverImage: String,
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    password: String,
    refreshToken: String,
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get email from command line or use default
        const adminEmail = process.argv[2] || 'janasougata198@gmail.com';
        
        console.log(`🔍 Looking for user with email/username: ${adminEmail}`);

        // First, let's list all users to help find the right one
        const allUsers = await User.find({}, 'username email fullname isAdmin').limit(10);
        console.log('\n📋 Available users in database:');
        allUsers.forEach(u => {
            console.log(`   - ${u.email} | Username: ${u.username} | Admin: ${u.isAdmin}`);
        });
        console.log('');

        // Check if user exists (case-insensitive search)
        let admin = await User.findOne({ 
            $or: [
                { email: { $regex: new RegExp(`^${adminEmail}$`, 'i') } },
                { username: { $regex: new RegExp(`^${adminEmail}$`, 'i') } }
            ]
        });

        if (admin) {
            // Update existing user to admin
            console.log('📝 Updating existing user to admin...');
            admin.isAdmin = true;
            await admin.save();
            console.log('✅ User updated successfully!');
            console.log('🎉 Admin Details:');
            console.log('   Username:', admin.username);
            console.log('   Email:', admin.email);
            console.log('   Fullname:', admin.fullname);
            console.log('   IsAdmin:', admin.isAdmin);
        } else {
            console.log('❌ User not found with email/username:', adminEmail);
            console.log('💡 Please use one of the emails/usernames listed above');
            console.log('💡 Usage: node create-admin.js <email-or-username>');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit();
    }
}

createAdminUser();
