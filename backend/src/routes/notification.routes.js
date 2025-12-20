import { Router } from "express";
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} from "../controllers/notification.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";
const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWt);

// Get all notifications
router.route("/").get(getUserNotifications);

// Get unread count
router.route("/unread-count").get(getUnreadCount);

// Mark all as read
router.route("/mark-all-read").patch(markAllAsRead);

// Clear all notifications
router.route("/clear-all").delete(clearAllNotifications);

// Mark single notification as read
router.route("/:notificationId/read").patch(markAsRead);

// Delete single notification
router.route("/:notificationId").delete(deleteNotification);

export default router;
