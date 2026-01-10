import mongoose, {isValidObjectId} from "mongoose";
import jwt from "jsonwebtoken";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { View } from "../models/view.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { moderateContent } from "../utils/contentModerator.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const pipeline = [
        {
            $match: {
                isPublished: true
            }
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
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ]

    if (userId && isValidObjectId(userId)) {
        pipeline.unshift({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    if (query) {
        pipeline.unshift({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        })
    }

    if (sortBy && sortType) {
        options.sort = { [sortBy]: sortType === "asc" ? 1 : -1 }
    }

    try {
        const aggregate = Video.aggregate(pipeline);
        const videos = await Video.aggregatePaginate(aggregate, options);
        return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw new ApiError(500, error.message || "Failed to fetch videos");
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    console.log('🎬 === VIDEO UPLOAD REQUEST RECEIVED ===');
    console.log('📝 Title:', req.body.title);
    console.log('📝 Description:', req.body.description);
    console.log('📁 Files:', req.files);
    
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // 🛡️ CONTENT MODERATION CHECK (FREE - No API keys needed)
    console.log('🔍 Checking content for inappropriate material...');
    
    let requiresManualReview = false;
    
    // Text-based moderation (checks titles, descriptions, filenames)
    try {
        const moderationResult = await moderateContent({
            title,
            description,
            videoPath: videoLocalPath,
            thumbnailPath: thumbnailLocalPath
        });

        if (!moderationResult.passed) {
            // Delete uploaded files before rejecting
            const fs = await import('fs');
            if (fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath);
            if (fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
            
            throw new ApiError(
                403, 
                `🚫 Upload blocked: ${moderationResult.reasons.join(' | ')}. Your content violates our community guidelines.`
            );
        }

        // Check if requires manual review
        requiresManualReview = moderationResult.requiresReview;
        
        if (requiresManualReview) {
            console.log('⚠️  Video flagged for manual review - will be unpublished until approved');
        } else {
            console.log('✅ Content passed all moderation checks - auto-approved');
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // If moderation service fails, require manual review for safety
        console.error('⚠️ Moderation check failed:', error.message);
        requiresManualReview = true;
    }

    const videoFile = await uploadCloudinary(videoLocalPath)
    const thumbnail = await uploadCloudinary(thumbnailLocalPath)

    if (!videoFile || videoFile.error) {
        throw new ApiError(400, "Video file upload failed")
    }

    if (!thumbnail || thumbnail.error) {
        throw new ApiError(400, "Thumbnail upload failed")
    }

    // 🤖 AI Content Analysis using Sightengine (checks thumbnail only for speed)
    console.log('🤖 Starting AI content analysis on thumbnail...');
    try {
        const { checkContent } = await import('../utils/sightengine.js');
        
        // Check thumbnail for inappropriate content
        const startTime = Date.now();
        const aiResult = await checkContent(thumbnail.url);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`⏱️  AI analysis completed in ${duration}s`);
        
        if (aiResult.inappropriate) {
            console.log('🚫 Upload rejected by AI moderation');
            
            // Delete uploaded files from Cloudinary
            const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
            console.log('🗑️  Deleting uploaded files...');
            await Promise.all([
                deleteFromCloudinary(videoFile.url),
                deleteFromCloudinary(thumbnail.url)
            ]);
            
            throw new ApiError(
                403, 
                aiResult.reason || '🚫 AI detected inappropriate content in your upload'
            );
        }
        
        console.log('✅ Content passed AI moderation!');
        
        // If AI check failed but didn't find inappropriate content, flag for manual review
        if (aiResult.requiresReview) {
            console.log('⚠️  AI check inconclusive - flagging for manual review');
            requiresManualReview = true;
        }
        
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw if it's our ApiError
        }
        console.error('⚠️  AI moderation error:', error.message);
        console.log('📝 Allowing upload but flagging for manual review');
        // If AI fails, allow upload but flag for manual review
        requiresManualReview = true;
    }

    // Create video with appropriate publish status
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublished: !requiresManualReview  // Unpublish if needs review
    })

    const uploadedVideo = await Video.findById(video._id)

    if (!uploadedVideo) {
        throw new ApiError(500, "Failed to upload video")
    }

    const responseMessage = requiresManualReview 
        ? "Video uploaded successfully! Your video is under review and will be published after approval."
        : "Video uploaded and published successfully!";

    return res.status(200).json(new ApiResponse(200, uploadedVideo, responseMessage))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Get viewer information
    let viewerId = null;
    const bearerToken = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")
    if (bearerToken) {
        try {
            const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET)
            viewerId = decoded?._id
        } catch (_) {}
    }

    // Track view - only increment if this is a unique view
    let viewRecorded = false;
    
    if (viewerId) {
        // For logged-in users: track by user ID
        try {
            const existingView = await View.findOne({ 
                video: videoId, 
                viewer: viewerId 
            });
            
            if (!existingView) {
                // Create new view record
                await View.create({
                    video: videoId,
                    viewer: viewerId,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });
                
                // Increment view count
                await Video.findByIdAndUpdate(videoId, {
                    $inc: { views: 1 }
                });
                
                viewRecorded = true;
            }
        } catch (error) {
            console.error("Error recording view:", error);
        }
        
        // Add to watch history
        await User.findByIdAndUpdate(
            viewerId,
            { $addToSet: { watchHistory: video._id } },
            { new: true }
        );
    } else {
        // For anonymous users: track by IP only (simpler and more reliable)
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        
        try {
            const existingView = await View.findOne({ 
                video: videoId, 
                ipAddress: ipAddress,
                viewer: null // Ensure we're looking for anonymous views
            });
            
            if (!existingView) {
                // Create new view record
                await View.create({
                    video: videoId,
                    ipAddress: ipAddress,
                    userAgent: req.headers['user-agent']
                });
                
                // Increment view count
                await Video.findByIdAndUpdate(videoId, {
                    $inc: { views: 1 }
                });
                
                viewRecorded = true;
            }
        } catch (error) {
            console.error("Error recording anonymous view:", error);
        }
    }

    const likeCount = await Like.countDocuments({ video: videoId })
    
    let isLiked = false
    if (viewerId) {
        const userLike = await Like.findOne({ video: videoId, likeBy: viewerId })
        isLiked = !!userLike
    }

    const videoWithOwner = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
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
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                likeCount: likeCount,
                isLiked: isLiked
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, videoWithOwner[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video publish status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}