import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET
});

const uploadCloudinary = async (filepath)=>{
  try {
    if(!filepath) return null;
    
    console.log("🚀 Starting upload to Cloudinary...");
    console.log("📁 File path:", filepath);
    
    // the file upload in cloudinary
   const response = await cloudinary.uploader.upload(filepath,{
      resource_type:'auto'
    })
    
    // file has been successfully uploaded
    console.log("✅ File uploaded to Cloudinary successfully!");
    console.log("📄 Response:", response);
    console.log("🔗 URL:", response.url);
    console.log("🔒 Secure URL:", response.secure_url);
    
    // Clean up local file after successful upload
    fs.unlinkSync(filepath);
    
    return response;
    
  }catch (error) {
    console.log("❌ Error uploading to Cloudinary:", error);
    console.log("📁 Failed file path:", filepath);
    
    // Clean up local file even if upload fails
    if(fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return null;
  }
}
export { uploadCloudinary }