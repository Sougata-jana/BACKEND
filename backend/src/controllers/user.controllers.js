import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { uploadCloudinary,  } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generatingRefreshAndAccessToken = async(userid)=>{
  try {
    const user = await User.findById(userid)
    const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

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

  console.log('=== LOGIN DEBUG ===');
  console.log('Received password:', password);
  console.log('Stored password hash:', user.password);
  console.log('User email:', user.email);
  console.log('User username:', user.username);

 const ispasswordValid = await user.isPasswordCorrect(password)
  console.log('Password validation result:', ispasswordValid);
  if(!ispasswordValid){
    throw new ApiError(401, "Invalid password")
  }

  const {refreshToken, accessToken} = await generatingRefreshAndAccessToken(user._id)
  const logedInUser = await User.findById(user._id).select("-password -refreshToken")

  // Debug: Log the user object to verify isAdmin is included
  console.log('=== LOGIN RESPONSE DEBUG ===');
  console.log('User object:', JSON.stringify(logedInUser, null, 2));
  console.log('isAdmin field:', logedInUser.isAdmin);
  console.log('===========================');

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(
    new ApiResponse(200,{
      user:logedInUser, accessToken, refreshToken
    },
    "User Logged in Successfully"
  )
  )
})
const logoutUser  = asyncHandler(async(req, res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1
      }
    },
    {
      new: true
    }
    
  )
  const option = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
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
   secure: true,
   sameSite: 'none'
  }
  const {accessToken, refreshToken: newRefreshToken}=await generatingRefreshAndAccessToken(user._id)
 
  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", newRefreshToken, option)
  .json(
   new ApiResponse(200,{
     accessToken,
     refreshToken : newRefreshToken
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

  const updates = {}
  if(fullname) updates.fullname = fullname
  if(username) updates.username = username
  if(email) updates.email = email
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updates
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
   const avatar = await uploadCloudinary(avatarLocalPath)

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
   const coverImage = await uploadCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new: true}
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
const {username} = req.params
if(!username?.trim()){
 throw new ApiError(400, "username is missing")
}

// Convert user ID to ObjectId for proper comparison
const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

const channel = await User.aggregate([

  {
    $match:{
      username: username?.toLowerCase()
    } 
  },
  {
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribeTo"
    }
  },
  {
    $addFields:{
      subscribersCount:{
        $size:"$subscribers"
      },
      channelSubscribeToCount:{
        $size:"$subscribeTo"
      },
      isSubscribed:{
        $cond:{
          if: {
            $in: [currentUserId, "$subscribers.subscriber"]
          },
          then: true,
          else: false
        }
      }
    },
  },
  {
    $project:{
      fullname: 1,
      username:1,
      avatar:1,
      coverImage:1,
      subscribersCount:1,
      channelSubscribeToCount:1,
      isSubscribed:1
    }
  }
])
if(!channel?.length){
  throw new ApiError(404, "Channel not found")
}
return res
.status(200)
.json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})
const getWatchHistory = asyncHandler (async(req, res)=>{
  const user =await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistoryVideos",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])
  return res
  .status(200)
  .json(new ApiResponse(200, user[0]?.watchHistoryVideos || [], "Watch history fetched successfully"))
})

// Temporary endpoint to make yourself admin - REMOVE IN PRODUCTION
const makeCurrentUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  user.isAdmin = true
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, { isAdmin: user.isAdmin }, "You are now an admin!"))
})

// Send OTP for signup
const sendSignupOTP = asyncHandler(async (req, res) => {
  console.log('📧 Send Signup OTP endpoint hit!');
  console.log('Request body:', req.body);
  
  const { email } = req.body;

  if (!email) {
    console.log('❌ Email is missing');
    throw new ApiError(400, "Email is required");
  }

  console.log('📨 Checking if user exists:', email);
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('❌ User already exists');
    throw new ApiError(409, "User with this email already exists");
  }

  console.log('🗑️ Deleting old OTPs...');
  // Delete any existing OTPs for this email and purpose
  await OTP.deleteMany({ email, purpose: 'signup' });

  console.log('🔢 Generating OTP...');
  // Generate and save OTP
  const otp = generateOTP();
  console.log('Generated OTP:', otp);
  
  await OTP.create({
    email,
    otp,
    purpose: 'signup'
  });
  console.log('✅ OTP saved to database');

  console.log('📤 Sending OTP email...');
  // Send OTP email
  try {
    await sendOTPEmail(email, otp, 'signup');
    console.log('✅ OTP email sent successfully!');
  } catch (emailError) {
    console.error('❌ Failed to send email:', emailError);
    throw new ApiError(500, "Failed to send OTP email. Please try again.");
  }

  return res.status(200).json(
    new ApiResponse(200, { email }, "OTP sent successfully to your email")
  );
});

// Verify OTP and complete signup
const verifySignupOTP = asyncHandler(async (req, res) => {
  const { email, otp, username, fullname, password, avatar, coverImage } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find and verify OTP
  const otpRecord = await OTP.findOne({
    email,
    otp,
    purpose: 'signup',
    verified: false,
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  // Validate all required fields
  if ([username, fullname, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Username, fullname, and password are required");
  }

  // Check if username is taken
  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avatar || "https://res.cloudinary.com/backendsougata/image/upload/v1234567890/default-avatar.png",
    coverImage: coverImage || ""
  });

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();

  // Send welcome email
  await sendWelcomeEmail(email, fullname);

  // Return created user
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res.status(201).json(
    new ApiResponse(201, createdUser, "Account created successfully")
  );
});

// Send OTP for login
const sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete any existing OTPs for this email and purpose
  await OTP.deleteMany({ email, purpose: 'login' });

  // Generate and save OTP
  const otp = generateOTP();
  await OTP.create({
    email,
    otp,
    purpose: 'login'
  });

  // Send OTP email
  await sendOTPEmail(email, otp, 'login');

  return res.status(200).json(
    new ApiResponse(200, { email }, "OTP sent successfully to your email")
  );
});

// Verify OTP and complete login
const verifyLoginOTP = asyncHandler(async (req, res) => {
  console.log('🔐 Verify Login OTP endpoint hit!');
  console.log('Request body:', req.body);
  
  const { email, otp } = req.body;

  if (!email || !otp) {
    console.log('❌ Email or OTP missing');
    throw new ApiError(400, "Email and OTP are required");
  }

  console.log('🔍 Searching for OTP in database...');
  console.log('Looking for:', { email, otp, purpose: 'login', verified: false });
  
  // Find and verify OTP
  const otpRecord = await OTP.findOne({
    email,
    otp,
    purpose: 'login',
    verified: false,
    expiresAt: { $gt: new Date() }
  });

  console.log('OTP Record found:', otpRecord);

  if (!otpRecord) {
    // Let's check if there's ANY OTP for this email
    const anyOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log('❌ No valid login OTP found. Latest OTP for this email:', anyOTP);
    throw new ApiError(401, "Invalid or expired OTP");
  }

  console.log('✅ Valid OTP found!');
  
  // Get user
  const user = await User.findOne({ email });
  if (!user) {
    console.log('❌ User not found');
    throw new ApiError(404, "User not found");
  }

  console.log('👤 User found:', user.email);

  // Generate tokens
  const { refreshToken, accessToken } = await generatingRefreshAndAccessToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();
  
  console.log('✅ Login successful!');

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  makeCurrentUserAdmin,
  sendSignupOTP,
  verifySignupOTP,
  sendLoginOTP,
  verifyLoginOTP
}