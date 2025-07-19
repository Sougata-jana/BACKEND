import { use } from "react";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { UploadApiResponse } from "../utils/ApiResponse.js";

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
        console.log("Request body:", req.body);
    
        if(
            [username, fullname, email, password].some((fields)=> fields?.trim() === "")
        ){
          throw  new ApiError(400, "All fields are required")
        }

      const existedUser =  user.findOne({
            $or: ({username}, {email})
        })
        

        if(existedUser){
            throw new ApiError(409,"user with username or email already existed")
        }

       const avatarLocalPath = req.files?.avatar[0]?.path
       const  coverImageLocalPath = req.files?.coverImage[0]?.path

       if(!avatarPath){
        throw new ApiError(400, "Avatar is required")
       }
        // console.log("Uploaded files", avatarPath);
        
       const avatar=  await uploadCloudinary(avatarLocalPath)
       const coverImage = await uploadCloudinary(coverImageLocalPath)

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
      "-password -refreshtoken"
     )

     if(!createdUser){
      throw new ApiError(500, "somthing went worng while regeistering user")
     }
       return res.status(201).json(
          new  UploadApiResponse(201, createdUser, "user created  successfully")
        )
})

export {registerUser}