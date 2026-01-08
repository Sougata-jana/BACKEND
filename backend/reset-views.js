import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "./src/models/video.model.js";
import { View } from "./src/models/view.model.js";

dotenv.config({ path: "./.env" });

const resetViewCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear all existing view records
        await View.deleteMany({});
        console.log("🗑️  Cleared all view records");

        // Reset all video view counts to 0
        await Video.updateMany({}, { $set: { views: 0 } });
        console.log("🔄 Reset all video view counts to 0");

        console.log("✅ View counts reset successfully!");
        console.log("📊 Now views will be counted uniquely per user/session");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    resetViewCounts();
}

export { resetViewCounts };
