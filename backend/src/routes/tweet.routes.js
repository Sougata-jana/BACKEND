import { Router } from "express";
import { 
    createTweet, 
    deleteTweet, 
    getAllTweets, 
    getUserTweets, 
    updateTweet 
} from "../controllers/tweet.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").get(getAllTweets)
router.route("/").post(verifyJWt, createTweet)

router.route("/user/:userId").get(getUserTweets)

router.route("/:tweetId")
    .patch(verifyJWt, updateTweet)
    .delete(verifyJWt, deleteTweet)

export default router;
