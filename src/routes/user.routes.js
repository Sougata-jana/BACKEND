import { Router } from "express";
import { getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
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
router.route("/user/:username").post(getUserChannelProfile)
//secure route
router.route("/logout").post(verifyJWt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router