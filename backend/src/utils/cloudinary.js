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

const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    // Extract public_id from cloudinary URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.log("❌ Invalid Cloudinary URL");
      return null;
    }

    // Get everything after 'upload/v{version}/' and before file extension
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

    console.log("🗑️  Deleting from Cloudinary...");
    console.log("📄 Public ID:", publicId);

    // Determine resource type based on URL
    let resourceType = 'image';
    if (fileUrl.includes('/video/')) {
      resourceType = 'video';
    } else if (fileUrl.includes('/raw/')) {
      resourceType = 'raw';
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    console.log("✅ File deleted from Cloudinary successfully!");
    console.log("📄 Response:", response);

    return response;
  } catch (error) {
    console.log("❌ Error deleting from Cloudinary:", error);
    return null;
  }
}

export { uploadCloudinary, deleteFromCloudinary }