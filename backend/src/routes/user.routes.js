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
    updateUserCoverImage 
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


//secure route
router.route("/logout").post(verifyJWt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWt, changeCurrentPassword)
router.route("/current-user").get(verifyJWt, getCurrentUser)
router.route("/update-account").patch(verifyJWt, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWt, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverimage").patch(verifyJWt, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWt,getUserChannelProfile)
router.route("/watch-history").get(verifyJWt,getWatchHistory)
export default router