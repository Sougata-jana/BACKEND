import { use } from "react";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";

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
        console.log("email:", email);
    
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
})

export {registerUser}