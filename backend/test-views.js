import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "./src/models/video.model.js";
import { View } from "./src/models/view.model.js";

dotenv.config({ path: "./.env" });

const testViewCounting = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Get first video for testing
        const video = await Video.findOne().limit(1);
        if (!video) {
            console.log("❌ No videos found in database");
            process.exit(1);
        }

        console.log(`📹 Testing with video: ${video.title}`);
        console.log(`🔢 Current views: ${video.views}\n`);

        // Count unique views
        const uniqueViews = await View.countDocuments({ video: video._id });
        console.log(`👁️  Unique view records: ${uniqueViews}`);

        // Count logged-in user views
        const loggedInViews = await View.countDocuments({ 
            video: video._id, 
            viewer: { $ne: null } 
        });
        console.log(`👤 Logged-in user views: ${loggedInViews}`);

        // Count anonymous views
        const anonymousViews = await View.countDocuments({ 
            video: video._id, 
            viewer: null 
        });
        console.log(`🔒 Anonymous views: ${anonymousViews}\n`);

        // Show breakdown by IP for anonymous views
        const anonBreakdown = await View.aggregate([
            { $match: { video: video._id, viewer: null } },
            { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
            { $limit: 5 }
        ]);
        
        if (anonBreakdown.length > 0) {
            console.log("📊 Anonymous views by IP (top 5):");
            anonBreakdown.forEach(item => {
                console.log(`   ${item._id}: ${item.count} view(s)`);
            });
        }

        console.log("\n✅ View counting test completed!");
        console.log("\n💡 How it works:");
        console.log("   - Each logged-in user = 1 view per video (forever)");
        console.log("   - Each IP address = 1 view per video (for anonymous users)");
        console.log("   - No matter how many times they visit!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

testViewCounting();
