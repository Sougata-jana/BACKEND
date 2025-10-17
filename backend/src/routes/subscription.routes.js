import { Router } from "express";
import { 
    getSubscribedChannels, 
    getUserChannelSubscribers, 
    toggleSubscription 
} from "../controllers/subscription.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWt) // Apply verifyJWt middleware to all routes in this file

router.route("/toggle/:channelId").post(toggleSubscription)

router.route("/subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/subscribed/:subscriberId").get(getSubscribedChannels)

export default router;
