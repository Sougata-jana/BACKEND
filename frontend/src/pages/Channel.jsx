import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Play, Users, Clock, Eye, Bell, BellOff } from 'lucide-react'
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const username = useMemo(() => (channelId === 'me' ? user?.username : channelId), [channelId, user?.username])

  useEffect(() => {
    const fetchChannel = async () => {
      if (!username) return
      try {
        setLoading(true)
        setChannel(null) // Reset channel state to ensure fresh data
        const { data } = await api.get(`/users/c/${username}`)
        const ch = data.data
        console.log('Fetched channel data:', { isSubscribed: ch.isSubscribed, subscribersCount: ch.subscribersCount })
        setChannel(ch)
        
        // Fetch notification status if subscribed
        if (ch.isSubscribed && user?._id && ch._id !== user._id) {
          try {
            const subStatus = await api.get(`/subscriptions/status/${ch._id}`)
            setNotificationsEnabled(subStatus.data.data.notificationsEnabled)
          } catch (err) {
            console.warn('Failed to fetch notification status', err)
          }
        }
        
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
  }, [username, user?._id])

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
        
        if (isSubscribed) {
          setNotificationsEnabled(true)
        }
        
        toast.success(isSubscribed ? 'Subscribed' : 'Unsubscribed')
        console.log('Subscription toggled, new status:', isSubscribed)
      } catch (err) {
        const msg = err.response?.data?.message || 'Subscription failed'
        toast.error(msg)
      }
    })
  }

  const toggleNotifications = async () => {
    if (!channel?._id) return
    try {
      const newNotificationState = !notificationsEnabled
      await api.patch(`/subscriptions/notifications/${channel._id}`, {
        notificationsEnabled: newNotificationState
      })
      setNotificationsEnabled(newNotificationState)
      toast.success(newNotificationState ? 'Notifications enabled' : 'Notifications disabled')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update notification settings'
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Ultra Modern Channel Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Animated Cover Image with Particles Effect */}
          <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
            {channel.coverImage ? (
              <>
                <img 
                  src={channel.coverImage} 
                  alt="cover" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
              </>
            ) : (
              <div className="relative w-full h-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-600">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-32 right-20 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-100" />
                  <div className="absolute bottom-20 left-32 w-24 h-24 bg-blue-300 rounded-full blur-3xl animate-pulse delay-200" />
                </div>
              </div>
            )}
            
            {/* Glassmorphism Info Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="glass backdrop-blur-2xl bg-white/10 dark:bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                  {/* Avatar - Simple & Clean */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="p-1 bg-white dark:bg-gray-900 rounded-full shadow-xl">
                      <img 
                        src={channel.avatar} 
                        alt={channel.username} 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-gray-900" 
                      />
                    </div>
                  </motion.div>
                  
                  {/* Channel Name & Stats */}
                  <div className="flex-1 text-center sm:text-left">
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100text-white mb-1 drop-shadow-lg"
                    >
                      {channel.fullname}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="dark:text-white/90 text-gray-700 text-sm sm:text-base font-medium mb-3 drop-shadow"
                    >
                      @{channel.username}
                    </motion.p>
                    
                    {/* Stats Pills */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3"
                    >
                      <div className="glass backdrop-blur-xl bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
                        <div className="p-1.5 bg-red-500/80 rounded-full">
                          <Users size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-black dark:text-white text-sm">{(channel.subscribersCount || 0).toLocaleString()}</span>
                        <span className="text-black/80 dark:text-white/80 text-xs">subscribers</span>
                      </div>
                      <div className="glass backdrop-blur-xl bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
                        <div className="p-1.5 bg-purple-500/80 rounded-full">
                          <Play size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-black dark:text-white text-sm">{videoCount}</span>
                        <span className="text-black/80 dark:text-white/80 text-xs">videos</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    {isAuthenticated ? (
                      isOwnChannel ? (
                        <div className="glass backdrop-blur-xl bg-white/30 dark:bg-black/30 px-6 py-3 rounded-full text-sm font-bold text-black dark:text-white border border-white/40 shadow-lg">
                          Your Channel
                        </div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleSubscription}
                            className={`px-6 sm:px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all duration-300 ${
                              channel.isSubscribed 
                                ? 'glass backdrop-blur-xl bg-white/30 dark:bg-black/30 text-white hover:bg-white/40 border border-white/40' 
                                : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                            }`}
                          >
                            {channel.isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                          </motion.button>
                          
                          {channel.isSubscribed && (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={toggleNotifications}
                              className="glass backdrop-blur-xl bg-white/30 dark:bg-black/30 p-3 rounded-full border border-white/40 shadow-lg transition-all duration-300 hover:bg-white/40"
                              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                            >
                              {notificationsEnabled ? (
                                <Bell size={20} className="text-white" />
                              ) : (
                                <BellOff size={20} className="text-white" />
                              )}
                            </motion.button>
                          )}
                        </>
                      )
                    ) : (
                      <Link 
                        to="/login" 
                        className="px-6 sm:px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                      >
                        Sign in
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Video Grid */}
        {videos.length ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-pink-600 rounded-full"></div>
              Videos
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({videos.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group card-hover"
                >
                  <Link to={`/video/${video._id}`} className="block">
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden mb-3 shadow-lg">
                      {video.thumbnail && (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      )}
                      
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-red-600 rounded-full p-4 shadow-2xl"
                        >
                          <Play className="w-8 h-8 text-white fill-white" />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="px-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-pink-600 transition-all duration-300 leading-snug mb-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <Eye size={14} />
                          {formatViews(video.views)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center w-32 h-32">
                <Play className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No videos yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isOwnChannel ? 'Start sharing your content with the world!' : 'This channel hasn\'t uploaded any videos yet.'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Channel
