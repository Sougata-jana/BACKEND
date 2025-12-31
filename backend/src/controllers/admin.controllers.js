import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// Get all videos (admin access)
const getAllVideosAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", search = "" } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === "desc" ? -1 : 1 }
    };

    const matchStage = search ? {
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    } : {};

    const pipeline = [
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: options.sort
        }
    ];

    const aggregateQuery = Video.aggregate(pipeline);
    const videos = await Video.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

// Delete video (admin access)
const deleteVideoAdmin = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Delete video file and thumbnail from cloudinary
    try {
        if (video.videoFile) {
            await deleteFromCloudinary(video.videoFile);
        }
        if (video.thumbnail) {
            await deleteFromCloudinary(video.thumbnail);
        }
    } catch (error) {
        console.error("Error deleting from cloudinary:", error);
    }

    // Delete all associated likes
    await Like.deleteMany({ video: videoId });

    // Delete the video
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

// Get analytics - Best performing videos
const getVideoAnalytics = asyncHandler(async (req, res) => {
    const { limit = 10, sortBy = "views" } = req.query;

    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                engagementScore: {
                    $add: [
                        { $multiply: ["$views", 1] },
                        { $multiply: [{ $size: "$likes" }, 5] }
                    ]
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ];

    // Determine sorting based on sortBy parameter
    if (sortBy === "likes") {
        pipeline.push({ $sort: { likesCount: -1 } });
    } else if (sortBy === "engagement") {
        pipeline.push({ $sort: { engagementScore: -1 } });
    } else {
        pipeline.push({ $sort: { views: -1 } });
    }

    pipeline.push({ $limit: parseInt(limit) });

    const bestVideos = await Video.aggregate(pipeline);

    // Get total statistics
    const stats = await Video.aggregate([
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                avgViews: { $avg: "$views" },
                publishedVideos: {
                    $sum: { $cond: ["$isPublished", 1, 0] }
                }
            }
        }
    ]);

    const totalLikes = await Like.countDocuments({ video: { $exists: true } });

    return res.status(200).json(
        new ApiResponse(200, {
            bestVideos,
            statistics: {
                ...stats[0],
                totalLikes
            }
        }, "Video analytics fetched successfully")
    );
});

// Get all channels/users with their statistics
const getAllChannels = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "subscribers", search = "" } = req.query;

    const matchStage = search ? {
        $or: [
            { username: { $regex: search, $options: "i" } },
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    } : {};

    const pipeline = [
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                videosCount: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                subscribers: 0,
                videos: 0,
                watchHistory: 0
            }
        }
    ];

    // Sorting
    const sortOptions = {};
    if (sortBy === "subscribers") {
        sortOptions.subscribersCount = -1;
    } else if (sortBy === "videos") {
        sortOptions.videosCount = -1;
    } else if (sortBy === "views") {
        sortOptions.totalViews = -1;
    } else {
        sortOptions.createdAt = -1;
    }

    pipeline.push({ $sort: sortOptions });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const channels = await User.aggregate(pipeline);

    // Get total count for pagination
    const totalCountPipeline = [{ $match: matchStage }, { $count: "total" }];
    const totalCount = await User.aggregate(totalCountPipeline);
    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    return res.status(200).json(
        new ApiResponse(200, {
            channels,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        }, "Channels fetched successfully")
    );
});

// Get overall dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get total users
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });

    // Get total videos
    const totalVideos = await Video.countDocuments();
    const publishedVideos = await Video.countDocuments({ isPublished: true });

    // Get total views
    const viewsData = await Video.aggregate([
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = viewsData.length > 0 ? viewsData[0].totalViews : 0;

    // Get total likes
    const totalLikes = await Like.countDocuments();

    // Get total subscriptions
    const totalSubscriptions = await Subscription.countDocuments();

    // Get recent videos (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVideos = await Video.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });

    // Get recent users (last 7 days)
    const recentUsers = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            users: {
                total: totalUsers,
                admins: totalAdmins,
                recentWeek: recentUsers
            },
            videos: {
                total: totalVideos,
                published: publishedVideos,
                unpublished: totalVideos - publishedVideos,
                recentWeek: recentVideos
            },
            engagement: {
                totalViews,
                totalLikes,
                totalSubscriptions
            }
        }, "Dashboard statistics fetched successfully")
    );
});

// Toggle user admin status
const toggleUserAdminStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, `User admin status updated to ${user.isAdmin}`)
    );
});

// Delete user account
const deleteUserAccount = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete all videos owned by the user
    const userVideos = await Video.find({ owner: userId });
    
    for (const video of userVideos) {
        try {
            if (video.videoFile) {
                await deleteFromCloudinary(video.videoFile);
            }
            if (video.thumbnail) {
                await deleteFromCloudinary(video.thumbnail);
            }
        } catch (error) {
            console.error("Error deleting from cloudinary:", error);
        }
    }

    await Video.deleteMany({ owner: userId });

    // Delete all likes by the user
    await Like.deleteMany({ likedBy: userId });

    // Delete all subscriptions
    await Subscription.deleteMany({ 
        $or: [
            { subscriber: userId },
            { channel: userId }
        ]
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, {}, "User account deleted successfully")
    );
});

export {
    getAllVideosAdmin,
    deleteVideoAdmin,
    getVideoAnalytics,
    getAllChannels,
    getDashboardStats,
    toggleUserAdminStatus,
    deleteUserAccount
};
