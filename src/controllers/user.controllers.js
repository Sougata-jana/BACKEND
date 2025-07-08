import { asyncHandler } from "../utils/asyncHandler.js";

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
    


})

export {registerUser}