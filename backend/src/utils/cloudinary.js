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
    
    console.log("🚀 Starting upload to Cloudinary with AI moderation...");
    console.log("📁 File path:", filepath);
    
    // Determine if it's a video or image
    const isVideo = filepath.match(/\.(mp4|mov|avi|webm|mkv)$/i);
    
    // Upload without AI moderation (requires paid Cloudinary subscription)
    // AI moderation disabled - not available on free/basic plans
    const uploadOptions = {
      resource_type: 'auto',
      // moderation: 'aws_rek', // Disabled - requires subscription
      quality: 'auto'
    };
    
    const response = await cloudinary.uploader.upload(filepath, uploadOptions);
    
    console.log("✅ File uploaded to Cloudinary!");
    console.log("🔗 URL:", response.secure_url);
    
    // Clean up local file after successful upload
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
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
    return response;
  } catch (error) {
    console.log("❌ Error deleting from Cloudinary:", error);
    return null;
  }
}

export { uploadCloudinary, deleteFromCloudinary }
