import { Bookmark } from "../models/bookmark.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create a new bookmark
const createBookmark = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { timestamp, title, note, color, tags, isPublic } = req.body;

    if (!timestamp || timestamp < 0) {
        throw new ApiError(400, "Valid timestamp is required");
    }

    if (!title?.trim()) {
        throw new ApiError(400, "Bookmark title is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if bookmark already exists at this timestamp
    const existingBookmark = await Bookmark.findOne({
        user: req.user._id,
        video: videoId,
        timestamp: Math.floor(timestamp)
    });

    if (existingBookmark) {
        throw new ApiError(400, "Bookmark already exists at this timestamp");
    }

    const bookmark = await Bookmark.create({
        user: req.user._id,
        video: videoId,
        timestamp: Math.floor(timestamp),
        title: title.trim(),
        note: note?.trim(),
        color: color || '#3B82F6',
        tags: tags || [],
        isPublic: isPublic || false
    });

    const populatedBookmark = await Bookmark.findById(bookmark._id)
        .populate('video', 'title thumbnail duration')
        .populate('user', 'username avatar');

    return res.status(201).json(
        new ApiResponse(201, populatedBookmark, "Bookmark created successfully")
    );
});

// Get all bookmarks for a user
const getUserBookmarks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, videoId, tag } = req.query;

    const query = { user: req.user._id };
    
    if (videoId) {
        query.video = videoId;
    }
    
    if (tag) {
        query.tags = tag;
    }

    const bookmarks = await Bookmark.find(query)
        .populate('video', 'title thumbnail duration owner')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Bookmark.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bookmarks,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalBookmarks: count
            },
            "Bookmarks fetched successfully"
        )
    );
});

// Get bookmarks for a specific video
const getVideoBookmarks = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const bookmarks = await Bookmark.find({
        user: req.user._id,
        video: videoId
    })
        .sort({ timestamp: 1 })
        .exec();

    return res.status(200).json(
        new ApiResponse(200, bookmarks, "Video bookmarks fetched successfully")
    );
});

// Update a bookmark
const updateBookmark = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;
    const { title, note, color, tags, isPublic } = req.body;

    const bookmark = await Bookmark.findOne({
        _id: bookmarkId,
        user: req.user._id
    });

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found");
    }

    if (title !== undefined) bookmark.title = title.trim();
    if (note !== undefined) bookmark.note = note.trim();
    if (color !== undefined) bookmark.color = color;
    if (tags !== undefined) bookmark.tags = tags;
    if (isPublic !== undefined) bookmark.isPublic = isPublic;

    await bookmark.save();

    const updatedBookmark = await Bookmark.findById(bookmark._id)
        .populate('video', 'title thumbnail duration')
        .populate('user', 'username avatar');

    return res.status(200).json(
        new ApiResponse(200, updatedBookmark, "Bookmark updated successfully")
    );
});

// Delete a bookmark
const deleteBookmark = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
        _id: bookmarkId,
        user: req.user._id
    });

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Bookmark deleted successfully")
    );
});

// Get bookmark statistics
const getBookmarkStats = asyncHandler(async (req, res) => {
    const stats = await Bookmark.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $group: {
                _id: null,
                totalBookmarks: { $sum: 1 },
                uniqueVideos: { $addToSet: "$video" }
            }
        },
        {
            $project: {
                _id: 0,
                totalBookmarks: 1,
                uniqueVideosCount: { $size: "$uniqueVideos" }
            }
        }
    ]);

    const recentBookmarks = await Bookmark.find({ user: req.user._id })
        .populate('video', 'title thumbnail')
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                stats: stats[0] || { totalBookmarks: 0, uniqueVideosCount: 0 },
                recentBookmarks
            },
            "Bookmark statistics fetched successfully"
        )
    );
});

// Get all unique tags
const getUserTags = asyncHandler(async (req, res) => {
    const tags = await Bookmark.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $unwind: "$tags"
        },
        {
            $group: {
                _id: "$tags",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $project: {
                _id: 0,
                tag: "$_id",
                count: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, tags, "Tags fetched successfully")
    );
});

export {
    createBookmark,
    getUserBookmarks,
    getVideoBookmarks,
    updateBookmark,
    deleteBookmark,
    getBookmarkStats,
    getUserTags
};
