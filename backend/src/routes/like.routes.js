import { Router } from "express";
import { 
    getLikedVideos, 
    toggleCommentLike, 
    toggleTweetLike, 
    toggleVideoLike,
    toggleVideoDislike
} from "../controllers/like.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWt) // Apply verifyJWt middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/dislike/v/:videoId").post(toggleVideoDislike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)

router.route("/videos").get(getLikedVideos)

export default router;
