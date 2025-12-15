import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Play, Users, Clock, Eye } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return (views || 0).toString()
}

const Channel = () => {
  const { channelId } = useParams()
  const { user, isAuthenticated, requireAuth } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videoCount, setVideoCount] = useState(0)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const username = useMemo(() => (channelId === 'me' ? user?.username : channelId), [channelId, user?.username])

  useEffect(() => {
    const fetchChannel = async () => {
      if (!username) return
      try {
        setLoading(true)
        setChannel(null) // Reset channel state to ensure fresh data
        const { data } = await api.get(`/user/c/${username}`)
        const ch = data.data
        console.log('Fetched channel data:', { isSubscribed: ch.isSubscribed, subscribersCount: ch.subscribersCount })
        setChannel(ch)
        try {
          const res = await api.get('/videos', { params: { userId: ch._id, limit: 1 } })
          const total = res.data?.data?.totalDocs ?? (res.data?.data?.docs?.length || 0)
          setVideoCount(total)
        } catch (err) {
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

  useEffect(() => {
    if (!channel?._id) return
    const fetchVideos = async () => {
      try {
        const { data } = await api.get('/videos', {
          params: { userId: channel._id, limit: 24, sortBy: 'createdAt', sortType: 'desc' }
        })
        setVideos(data.data?.docs || [])
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load videos'
        toast.error(msg)
      }
    }
    fetchVideos()
  }, [channel?._id])

  const toggleSubscription = async () => {
    if (!channel?._id) return
    requireAuth(async () => {
      try {
        const response = await api.post(`/subscriptions/toggle/${channel._id}`)
        const { isSubscribed } = response.data.data
        
        setChannel((prev) => ({
          ...prev,
          isSubscribed: isSubscribed,
          subscribersCount: Math.max(0, (prev?.subscribersCount || 0) + (isSubscribed ? 1 : -1)),
        }))
        toast.success(isSubscribed ? 'Subscribed' : 'Unsubscribed')
        console.log('Subscription toggled, new status:', isSubscribed)
      } catch (err) {
        const msg = err.response?.data?.message || 'Subscription failed'
        toast.error(msg)
      }
    })
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
    <div className="max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Modern Channel Header */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
          {/* Cover Image with Gradient Overlay */}
          <div className="h-48 sm:h-64 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 overflow-hidden relative">
            {channel.coverImage ? (
              <>
                <img src={channel.coverImage} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-600" />
            )}
          </div>
          
          {/* Channel Info */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar with Ring */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="-mt-16 sm:-mt-20"
              >
                <div className="p-1 bg-gradient-to-br from-red-500 to-pink-500 rounded-full">
                  <img 
                    src={channel.avatar} 
                    alt={channel.username} 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-gray-900" 
                  />
                </div>
              </motion.div>
              
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {channel.fullname}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4">@{channel.username}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Users size={18} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{(channel.subscribersCount || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">subscribers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Play size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{videoCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">videos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="w-full sm:w-auto">
                {isAuthenticated ? (
                  isOwnChannel ? (
                    <motion.span 
                      whileHover={{ scale: 1.02 }}
                      className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold glass border shadow-sm"
                    >
                      Your channel
                    </motion.span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSubscription}
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 ${
                        channel.isSubscribed 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700' 
                          : 'btn-gradient text-white'
                      }`}
                    >
                      {channel.isSubscribed ? '✓ Subscribed' : 'Subscribe'}
                    </motion.button>
                  )
                ) : (
                  <Link 
                    to="/login" 
                    className="inline-block w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm btn-gradient text-white text-center shadow-lg"
                  >
                    Sign in to subscribe
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {videos.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
              >
                <Link to={`/video/${video._id}`} className="block relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </Link>
                <div className="p-3 space-y-2">
                  <Link to={`/video/${video._id}`} className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-400">
                    {video.title}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Eye size={14} />
                    {formatViews(video.views)} views
                    <span>•</span>
                    <Clock size={14} />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600 dark:text-gray-400">
            No videos published yet.
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Channel
