import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { useId } from "react";

const generatingRefreshAndAccessToken = async(userid)=>{
  try {
    const user = await User.findById(userid)
    const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validatebeforeSave: false})

    return{refreshToken, accessToken}

  } catch (error) {
    throw new ApiError(500, "something  went wrong while generating refresh and assess  token")
  }
}
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
const loginUser = asyncHandler(async(req, res)=>{
  // req body => data
  //  usernme, email
  // password
  // check if user exists
  // check password
  //access token refresh token
  // send cookies

  const {username, email, password}= req.body

  if(!username && !email){
    throw new ApiError(400, "username or eemail is are required")
  }

  const user = await User.findOne({
    $or:[{username}, {email}]
  })

  if(!user){
    throw new ApiError(404, "user not found")
  }

 const ispasswordValid = await user.isPasswordCorrect(password)
  if(!ispasswordValid){
    throw new ApiError(401, "Invalid password")
  }

  const {refreshToken, accessToken} = await generatingRefreshAndAccessToken(user._id)
  const logedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
    http: true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(
    new ApiResponse(200,{
      user:logedInUser, accessToken, refreshToken
    }),
    "User Logged in Successfully"
  )
})
const logoutUser  = asyncHandler(async(req, res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
    
  )
  const option = {
    http: true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken", option)
  .clearCookie("refreshToken", option)
  .json (new ApiResponse(200, null, "User logged out successfully"))

})
const refreshAccessToken = asyncHandler(async(req, res)=>{
  const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingrefreshToken){
    throw new ApiError(401, "Unauthorized, no refresh token provided")
  }
 try {
   const decodedToken =  jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(404, "invalid refresh token")
   }
 
  if (incomingrefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "refresh token is exppired or used")
  }
 
  const option = {
   httpOnly: true,
   secure: true
  }
  const {accessToken, newrefreshToken}=await generatingRefreshAndAccessToken(user._id)
 
  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", newrefreshToken, option)
  .json(
   new ApiResponse(200,{
     accessToken,
     refreshToken : newrefreshToken
   },
   "Access token refreshed successfully"
   )
  )
 } catch (error) {
  throw new ApiError(500, error?.message || "something went wrong while refreshing access token")
 }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(401, "Old password is incorrect")
  }
  user.password = newPassword
 await user.save({validateBeforeSave: false})
 return res
 .status(200)
 .json(new ApiResponse(200, {}, "Password changed successfully"))
})
const getCurrentUser = asyncHandler(async(req, res)=>{
return res
.status(200)
.json(new ApiResponse(200, req.user, "Current user fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname, username, email} = req.body

  const user = User.findByIdAndUpdate(req.user?._id,
   
     {
        $set:{
          fullname,
           username,
           email,
        }
    },
    {
      new: true
    }
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res)=>
  {
  const avatarLocalPath = req.file?.path  
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
  }
   const avatar = uploadCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new: true}
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res)=>
  {
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400, "Cover image file is missing")
  }
   const coverImage = uploadCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new: true}
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User cover image updated successfully"))
})
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}