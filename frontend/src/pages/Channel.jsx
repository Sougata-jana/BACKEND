import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { Play, Users } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Channel = () => {
  const { channelId } = useParams() // this is actually username or 'me'
  const { user, isAuthenticated } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videoCount, setVideoCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const username = useMemo(() => (channelId === 'me' ? user?.username : channelId), [channelId, user?.username])

  useEffect(() => {
    const fetchChannel = async () => {
      if (!username) return
      try {
        setLoading(true)
        // Backend requires auth for channel profile
        const { data } = await api.get(`/user/c/${username}`)
        const ch = data.data
        setChannel(ch)
        // fetch video count for this channel's user id using videos endpoint
        try {
          const res = await api.get('/videos', { params: { userId: ch._id, limit: 1 } })
          const total = res.data?.data?.totalDocs ?? (res.data?.data?.docs?.length || 0)
          setVideoCount(total)
        } catch (err) {
          // ignore count error, keep page usable
          console.warn('Video count error', err)
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load channel'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchChannel()
  }, [username])

  const toggleSubscription = async () => {
    if (!channel?._id) return
    try {
      const { data } = await api.post(`/subscriptions/toggle/${channel._id}`)
      // Backend responds with the subscription toggled; we’ll locally update counts
      const wasSubscribed = channel.isSubscribed
      setChannel((prev) => ({
        ...prev,
        isSubscribed: !wasSubscribed,
        subscribersCount: Math.max(0, (prev?.subscribersCount || 0) + (wasSubscribed ? -1 : 1)),
      }))
      toast.success(!wasSubscribed ? 'Subscribed' : 'Unsubscribed')
    } catch (err) {
      const msg = err.response?.data?.message || 'Subscription failed'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Channel not found</h2>
      </div>
    )
  }

  const isOwnChannel = user?._id && channel?._id && user._id === channel._id

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Channel Header */}
        <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          {/* Cover image */}
          <div className="h-40 sm:h-56 bg-gray-200 dark:bg-gray-800 overflow-hidden">
            {channel.coverImage ? (
              <img src={channel.coverImage} alt="cover" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <img src={channel.avatar} alt={channel.username} className="w-24 h-24 rounded-full object-cover border" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{channel.fullname}</h1>
                <p className="text-gray-600 dark:text-gray-400">@{channel.username}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1"><Users size={16} /> {channel.subscribersCount || 0} subscribers</span>
                  <span className="inline-flex items-center gap-1"><Play size={16} /> {videoCount} videos</span>
                </div>
              </div>

              {/* Subscribe button */}
              {isAuthenticated ? (
                isOwnChannel ? (
                  <span className="px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border">Your channel</span>
                ) : (
                <button
                  onClick={toggleSubscription}
                  className={`px-6 py-2 rounded-full font-medium ${channel.isSubscribed ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                )
              ) : (
                <a href="/login" className="px-6 py-2 rounded-full font-medium bg-red-600 text-white">Sign in to subscribe</a>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for channel content (videos, playlists, about) */}
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Channel</h2>
          <p className="text-gray-600 dark:text-gray-400">Channel videos and playlists will appear here.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Channel
