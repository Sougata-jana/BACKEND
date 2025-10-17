import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const  verifyJWt = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies.accessToken || req.header("authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized, No token provided")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
      const user=   await User.findById(decodedToken._id).select("-password -refreshToken")
      if(!user){
        throw new ApiError (404, "access Token not avaliable")
      }
      req.user = user
      next()
    } catch (error) {
        throw new ApiError(401, "invalid access token")
    }
})