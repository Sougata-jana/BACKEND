import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    makeCurrentUserAdmin,
    sendSignupOTP,
    verifySignupOTP,
    sendLoginOTP,
    verifyLoginOTP
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middewares.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

// OTP-based authentication routes
router.route("/send-signup-otp").post(sendSignupOTP)
router.route("/verify-signup-otp").post(verifySignupOTP)
router.route("/send-login-otp").post(sendLoginOTP)
router.route("/verify-login-otp").post(verifyLoginOTP)

//secure route
router.route("/logout").post(verifyJWt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWt, changeCurrentPassword)
router.route("/current-user").get(verifyJWt, getCurrentUser)
router.route("/update-account").patch(verifyJWt, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWt, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverimage").patch(verifyJWt, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(getUserChannelProfile)
router.route("/watch-history").get(verifyJWt,getWatchHistory)

// Temporary route to make yourself admin - REMOVE IN PRODUCTION
router.route("/make-me-admin").post(verifyJWt, makeCurrentUserAdmin)

export default router