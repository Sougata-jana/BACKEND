import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likeBy: req.user._id
    })

    let like
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        like = null
    } else {
        like = await Like.create({
            video: videoId,
            likeBy: req.user._id
        })
    }

    const likeCount = await Like.countDocuments({ video: videoId })

    return res.status(200).json(new ApiResponse(200, { like, likeCount, isLiked: !!like }, `Video ${like ? "liked" : "unliked"} successfully`))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likeBy: req.user._id
    })

    let like
    if (existingLike) {
        // Unlike the comment
        await Like.findByIdAndDelete(existingLike._id)
        like = null
    } else {
        // Like the comment
        like = await Like.create({
            comment: commentId,
            likeBy: req.user._id
        })
    }

    return res.status(200).json(new ApiResponse(200, { like }, `Comment ${like ? "liked" : "unliked"} successfully`))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likeBy: req.user._id
    })

    let like
    if (existingLike) {
        // Unlike the tweet
        await Like.findByIdAndDelete(existingLike._id)
        like = null
    } else {
        // Like the tweet
        like = await Like.create({
            tweet: tweetId,
            likeBy: req.user._id
        })
    }

    return res.status(200).json(new ApiResponse(200, { like }, `Tweet ${like ? "liked" : "unliked"} successfully`))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const pipeline = [
        {
            $match: {
                likeBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullname: 1,
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
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $match: {
                "video.isPublished": true
            }
        }
    ]

    const likedVideos = await Like.aggregatePaginate(Like.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
