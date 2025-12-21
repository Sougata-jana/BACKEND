import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true
        },
        timestamp: {
            type: Number,  // Time in seconds
            required: true,
            min: 0
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        note: {
            type: String,
            trim: true,
            maxlength: 500
        },
        color: {
            type: String,
            default: '#3B82F6',  // Blue
            enum: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
        },
        isPublic: {
            type: Boolean,
            default: false  // Private by default
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }]
    },
    { timestamps: true }
);

// Compound index for efficient querying
bookmarkSchema.index({ user: 1, video: 1, timestamp: 1 });
bookmarkSchema.index({ user: 1, createdAt: -1 });

// Format timestamp to HH:MM:SS
bookmarkSchema.methods.getFormattedTimestamp = function() {
    const hours = Math.floor(this.timestamp / 3600);
    const minutes = Math.floor((this.timestamp % 3600) / 60);
    const seconds = Math.floor(this.timestamp % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
