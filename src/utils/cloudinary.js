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
    // the file upload in cloudinary
   const responce = await cloudinary.uploader.upload(filepath,{
      resource_type:'auto'
    })
    
    // file has been successfully
    console.log("the file is uploaded on cloudinary");
    
  }catch (error) {
    fs.unlinkSync(filepath);// delete the file from local storage
    return null;
  }
  
}

export default uploadCloudinary;