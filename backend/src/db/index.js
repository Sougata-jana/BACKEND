import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
     const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
     console.log(`\n MongoDB connected !! db host ${
        connectionInstance.connection.host} `);
     
    } catch (error){
        console.error("MongoDB Concetion failed", error);
        process.exit(1);
    }
}

export default connectDB;