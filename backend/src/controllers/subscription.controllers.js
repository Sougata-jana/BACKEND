import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.controllers.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    console.log('Toggle subscription request - User:', req.user._id, 'Channel:', channelId)

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    console.log('Existing subscription:', existingSubscription ? 'Yes' : 'No')

    let subscription
    let isSubscribed
    if (existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id)
        subscription = null
        isSubscribed = false
        console.log('Unsubscribed successfully')
    } else {
        // Subscribe
        subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        isSubscribed = true
        console.log('Subscribed successfully, subscription ID:', subscription._id)
        
        // Create notification for channel owner
        await createNotification({
            recipient: channelId,
            sender: req.user._id,
            type: 'subscription',
            content: `${req.user.username} subscribed to your channel`,
            actionUrl: `/channel/${req.user._id}`
        })
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            { subscription, isSubscribed }, 
            `Channel ${subscription ? "subscribed" : "unsubscribed"} successfully`
        )
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const pipeline = [
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ]

    const subscribers = await Subscription.aggregatePaginate(Subscription.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const pipeline = [
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: {
                    $first: "$channel"
                }
            }
        }
    ]

    const subscribedChannels = await Subscription.aggregatePaginate(Subscription.aggregate(pipeline), options)

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
