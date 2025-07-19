import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { url } from 'inspector';
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET
});

const uploadCloudinary = async (filepath)=>{
  try {
    if(!filepath) return null;
    // the file upload in cloudinary
   const response = await cloudinary.uploader.upload(localFilepath,{
      resource_type:'auto'
    })
    
    // file has been successfully
    console.log("the file is uploaded on cloudinary", response.url);
    return response
    
  }catch (error) {
    fs.unlinkSync(filepath);// delete the file from local storage
    return null;
  }
  
}

export {uploadCloudinary};