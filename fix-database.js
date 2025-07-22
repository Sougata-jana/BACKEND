import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL + "/Youtube");
        console.log("Connected to MongoDB");
        
        // Get the database
        const db = mongoose.connection.db;
        
        // Check if users collection exists
        const collections = await db.listCollections().toArray();
        const usersCollection = collections.find(col => col.name === 'users');
        
        if (usersCollection) {
            console.log("Users collection found. Dropping it...");
            await db.collection('users').drop();
            console.log("✅ Users collection dropped successfully!");
        } else {
            console.log("Users collection not found.");
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed.");
        
    } catch (error) {
        console.error("Error fixing database:", error);
        process.exit(1);
    }
};

fixDatabase();
