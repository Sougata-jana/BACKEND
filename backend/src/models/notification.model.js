import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: [
                'like',           // Someone liked your video/comment/tweet
                'comment',        // Someone commented on your video
                'reply',          // Someone replied to your comment
                'subscription',   // Someone subscribed to your channel
                'upload',         // Someone you subscribed to uploaded a video
                'mention',        // Someone mentioned you
            ],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        actionUrl: {
            type: String  // URL to navigate when notification is clicked
        }
    },
    { timestamps: true }
);

// Index for efficient querying of unread notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
