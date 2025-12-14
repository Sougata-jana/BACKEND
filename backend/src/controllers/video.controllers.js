import mongoose, {isValidObjectId} from "mongoose";
import jwt from "jsonwebtoken";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

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

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
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

    const videoFile = await uploadCloudinary(videoLocalPath)
    const thumbnail = await uploadCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Video file upload failed")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload failed")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublished: true
    })

    const uploadedVideo = await Video.findById(video._id)

    if (!uploadedVideo) {
        throw new ApiError(500, "Failed to upload video")
    }

    return res.status(200).json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"))
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

    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })

    let viewerId
    const bearerToken = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")
    if (bearerToken) {
        try {
            const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET)
            viewerId = decoded?._id
        } catch (_) {}
    }

    if (viewerId) {
        await User.findByIdAndUpdate(
            viewerId,
            { $addToSet: { watchHistory: video._id } },
            { new: true }
        )
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