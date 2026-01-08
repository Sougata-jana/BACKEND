import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true
        },
        viewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Compound index for logged-in users (one view per user per video)
viewSchema.index({ video: 1, viewer: 1 }, { 
    unique: true, 
    partialFilterExpression: { viewer: { $ne: null } }
});

// Compound index for anonymous users (one view per IP per video)
viewSchema.index({ video: 1, ipAddress: 1 }, { 
    unique: true,
    partialFilterExpression: { viewer: null }
});

export const View = mongoose.model("View", viewSchema);
