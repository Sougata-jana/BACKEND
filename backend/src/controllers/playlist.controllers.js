import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoCount: { $size: "$videos" }
            }
        }
    ]

    const playlists = await Playlist.aggregatePaginate(Playlist.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const playlistWithVideos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
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
                owner: { $first: "$owner" }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
        }
    ])

    return res.status(200).json(new ApiResponse(200, playlistWithVideos[0], "Playlist fetched successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own playlists")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.name,
                description: description || playlist.description
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own playlists")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only add videos to your own playlists")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only remove videos from your own playlists")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}
