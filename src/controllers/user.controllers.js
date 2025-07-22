import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async(req, res) =>{
    // get user details from request body 
    // validation are - empty
    // check if user already exists - emial, username
    // check for iamge , check for avatar
    // upload them to cloudinary ,avatar
    // create user object, create enetry in db
    // remove the passwird, refresh token fields form responce   
    // check for user creation 
    // return responce


 const {username, fullname, email, password}  = req.body 
    console.log("request of body",req.body);
    
        if(
            [username, fullname, email, password].some((field)=> field?.trim() === "")
        ){
          throw  new ApiError(400, "All fields are required")
        }

      const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
        

        if(existedUser){
            throw new ApiError(409,"user with username or email already existed")
        }

       const avatarLocalPath = req.files?.avatar[0]?.path
       //const  coverImageLocalPath = req.files?.coverImage[0]?.path

       let coverImageLocalPath;
       if(req.files && Array.isArray(req.files.coverImage)
          &&  req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
        }

       console.log("📁 Avatar local path:", avatarLocalPath);
       console.log("📁 Cover image local path:", coverImageLocalPath);
       console.log("📂 req.files:", req.files);

       if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
       }
        // console.log("Uploaded files", avatarPath);
        
       console.log("🚀 Starting avatar upload...");
       const avatar=  await uploadCloudinary(avatarLocalPath)
       console.log("✅ Avatar upload result:", avatar);
       
       console.log("🚀 Starting cover image upload...");
       const coverImage = await uploadCloudinary(coverImageLocalPath)
       console.log("✅ Cover image upload result:", coverImage);

       if(!avatar){
         throw new ApiError(400, "Avatar upload failed")
       }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
       })

     const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
     )

     if(!createdUser){
      throw new ApiError(500, "somthing went worng while regeistering user")
     }
       return res.status(201).json(
          new  ApiResponse(201, createdUser, "user created  successfully")
        )
})

export {registerUser}