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
    
    // Upload with AI moderation enabled (uses AWS Rekognition built into Cloudinary)
    const uploadOptions = {
      resource_type: 'auto',
      moderation: 'aws_rek', // Enable AI content moderation
      quality: 'auto'
    };
    
    const response = await cloudinary.uploader.upload(filepath, uploadOptions);
    
    console.log("✅ File uploaded to Cloudinary!");
    console.log("🔗 URL:", response.secure_url);
    
    // Check AI moderation results
    if (response.moderation && response.moderation.length > 0) {
      const moderationResult = response.moderation[0];
      console.log("🔍 AI Moderation Check:", moderationResult);
      
      // AWS Rekognition provides confidence scores for different categories
      const modLabels = moderationResult.response?.moderation_labels || [];
      
      // Check for explicit content
      const explicitContent = modLabels.filter(label => 
        ['Explicit Nudity', 'Graphic Male Nudity', 'Graphic Female Nudity', 
         'Sexual Activity', 'Illustrated Explicit Nudity', 'Adult Toys'].includes(label.name)
      );
      
      const suggestiveContent = modLabels.filter(label =>
        ['Suggestive', 'Female Swimwear Or Underwear', 'Male Swimwear Or Underwear',
         'Partial Nudity', 'Barechested Male', 'Revealing Clothes'].includes(label.name)
      );
      
      const violentContent = modLabels.filter(label =>
        ['Violence', 'Graphic Violence Or Gore', 'Physical Violence',
         'Weapon Violence', 'Weapons', 'Self Injury'].includes(label.name)
      );
      
      // Determine if content should be rejected
      const hasExplicit = explicitContent.some(l => l.confidence > 60);
      const hasHighSuggestive = suggestiveContent.some(l => l.confidence > 80);
      const hasViolence = violentContent.some(l => l.confidence > 70);
      
      if (hasExplicit || hasHighSuggestive || hasViolence) {
        console.log("❌ INAPPROPRIATE CONTENT DETECTED!");
        console.log("📊 Explicit:", explicitContent.map(l => `${l.name} (${l.confidence}%)`));
        console.log("📊 Suggestive:", suggestiveContent.map(l => `${l.name} (${l.confidence}%)`));
        console.log("📊 Violence:", violentContent.map(l => `${l.name} (${l.confidence}%)`));
        
        // Delete the uploaded file from Cloudinary immediately
        const publicId = response.public_id;
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: isVideo ? 'video' : 'image' 
        });
        console.log("🗑️  Inappropriate file deleted from Cloudinary");
        
        // Clean up local file
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        
        // Return error indicator
        return { 
          error: true, 
          inappropriate: true,
          message: 'AI detected inappropriate content in your video/image',
          details: {
            explicit: explicitContent,
            suggestive: suggestiveContent,
            violence: violentContent
          }
        };
      }
      
      console.log("✅ Content passed AI moderation checks");
    }
    
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
