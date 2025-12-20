import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get all notifications for the logged-in user
const getUserNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { recipient: req.user._id };
    
    if (unreadOnly === 'true') {
        query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
        .populate('sender', 'username avatar fullname')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    
    const count = await Notification.countDocuments(query);
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalNotifications: count
            },
            "Notifications fetched successfully"
        )
    );
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });
    
    return res.status(200).json(
        new ApiResponse(200, { unreadCount: count }, "Unread count fetched successfully")
    );
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: req.user._id
    });
    
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    
    notification.isRead = true;
    await notification.save();
    
    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );
    
    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: req.user._id
    });
    
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
});

// Delete all notifications
const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id });
    
    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications cleared successfully")
    );
});

// Helper function to create a notification (used by other controllers)
const createNotification = async ({ recipient, sender, type, content, actionUrl, video, comment, tweet }) => {
    try {
        // Don't create notification if sender and recipient are the same
        if (recipient.toString() === sender.toString()) {
            return null;
        }
        
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            content,
            actionUrl,
            video,
            comment,
            tweet
        });
        
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

export {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification
};
