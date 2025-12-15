import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { days = 28 } = req.query
    const userId = req.user._id

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    // Get all user's videos
    const videos = await Video.find({ owner: userId })
    const videoIds = videos.map(v => v._id)

    // Total views on all videos
    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)

    // Views in the last N days (we'll approximate this by getting recent video views)
    const recentVideos = await Video.find({
        owner: userId,
        createdAt: { $gte: startDate }
    })
    const recentViews = recentVideos.reduce((sum, video) => sum + (video.views || 0), 0)

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    })

    // New subscribers in the last N days
    const newSubscribers = await Subscription.countDocuments({
        channel: userId,
        createdAt: { $gte: startDate }
    })

    // Total likes
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds },
        isLike: true
    })

    // Total videos
    const totalVideos = videos.length

    // Published videos
    const publishedVideos = await Video.countDocuments({
        owner: userId,
        isPublished: true
    })

    // Recent likes (last N days)
    const recentLikes = await Like.countDocuments({
        video: { $in: videoIds },
        isLike: true,
        createdAt: { $gte: startDate }
    })

    // Get top performing videos
    const topVideos = await Video.find({ owner: userId })
        .sort({ views: -1 })
        .limit(5)
        .select('title views thumbnail duration createdAt')

    // Get recent subscriber list with details
    const recentSubscribersList = await Subscription.find({
        channel: userId
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('subscriber', 'username fullname avatar')

    return res.status(200).json(new ApiResponse(200, {
        totalViews,
        recentViews,
        totalSubscribers,
        newSubscribers,
        totalLikes,
        totalVideos,
        publishedVideos,
        recentLikes,
        topVideos,
        recentSubscribersList,
        period: `${days} days`
    }, "Channel stats fetched successfully"))
})

const getVideoStats = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId).populate('owner', 'username fullname avatar')

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Verify ownership
    if (video.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to access these stats")
    }

    // Get likes and dislikes
    const likes = await Like.countDocuments({
        video: videoId,
        isLike: true
    })

    const dislikes = await Like.countDocuments({
        video: videoId,
        isLike: false
    })

    return res.status(200).json(new ApiResponse(200, {
        video: {
            _id: video._id,
            title: video.title,
            description: video.description,
            views: video.views,
            duration: video.duration,
            thumbnail: video.thumbnail,
            isPublished: video.isPublished,
            createdAt: video.createdAt
        },
        likes,
        dislikes,
        engagement: video.views > 0 ? ((likes + dislikes) / video.views * 100).toFixed(2) : 0
    }, "Video stats fetched successfully"))
})

export {
    getChannelStats,
    getVideoStats
}
