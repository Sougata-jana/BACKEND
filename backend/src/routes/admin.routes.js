import { Router } from "express";
import {
    getAllVideosAdmin,
    deleteVideoAdmin,
    getVideoAnalytics,
    getAllChannels,
    getDashboardStats,
    toggleUserAdminStatus,
    deleteUserAccount
} from "../controllers/admin.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/admin.middlewares.js";

const router = Router();

// Apply both authentication and admin verification to all routes
router.use(verifyJWt, verifyAdmin);

// Dashboard statistics
router.route("/dashboard/stats").get(getDashboardStats);

// Video management routes
router.route("/videos").get(getAllVideosAdmin);
router.route("/videos/:videoId").delete(deleteVideoAdmin);

// Analytics routes
router.route("/analytics/videos").get(getVideoAnalytics);

// Channel/User management routes
router.route("/channels").get(getAllChannels);
router.route("/users/:userId/toggle-admin").patch(toggleUserAdminStatus);
router.route("/users/:userId").delete(deleteUserAccount);

export default router;
