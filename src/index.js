import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: "./env"
})

connectDB()
.then(()=>{
    // app.listen("error", (error)=>{
    //     console.error("ERROR", error);
        
    // })
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`server is running at port ${process.env.PORT}`); 
    })
})
.catch((error)=>{
    console.error("MongoDB Connection failed", error)
})








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