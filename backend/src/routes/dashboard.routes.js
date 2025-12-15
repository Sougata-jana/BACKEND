import { Router } from "express";
import { getChannelStats, getVideoStats } from "../controllers/dashboard.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWt)

router.route("/stats").get(getChannelStats)
router.route("/stats/video/:videoId").get(getVideoStats)

export default router;
