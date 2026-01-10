import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { loadModel } from "./utils/contentModerator.js";

dotenv.config({
    path: "./.env"
})

// Initialize for Vercel serverless
let isInitialized = false;

const initializeApp = async () => {
    if (isInitialized) return;
    
    try {
        // Connect to database
        await connectDB();
        
        // Load content moderation model
        console.log('🔄 Loading content moderation model...');
        await loadModel();
        console.log('✅ Content moderation ready!');
        
        isInitialized = true;
    } catch (error) {
        console.error("❌ Initialization failed:", error);
        throw error;
    }
};

// For Vercel serverless deployment
if (process.env.VERCEL) {
    // Initialize once on cold start
    initializeApp().catch(console.error);
} else {
    // For local development, start server normally
    const startServer = async () => {
        try {
            await initializeApp();
            
            // Start server
            app.listen(process.env.PORT || 3000, () => {
                console.log(`✅ Server is running at port ${process.env.PORT || 3000}`);
            });
        } catch (error) {
            console.error("❌ Server startup failed:", error);
            process.exit(1);
        }
    };
    
    startServer();
}

// Export for Vercel
export default app;








/*
import express from "express";

const app = express();
(async()=>{
    try {
       await mongoose.connect($`{process.env.MONGODB_URL}/${DB_NAME}`, )
       app.on("error", (error)=>{
        console.error("ERROR", error);
        throw error;
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
        
       })

    } catch (error) {
        console.error("Error", error);
        throw error;
    }
})()
    */