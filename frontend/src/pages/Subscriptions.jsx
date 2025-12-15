import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { Flame, Users, Play, Eye, Clock, Grid, List, SortAsc, Bell, BellOff, Settings as SettingsIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return (views || 0).toString()
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const Subscriptions = () => {
  const { user, isAuthenticated, requireAuth } = useAuth()
  const [channels, setChannels] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('videos') // 'videos' or 'channels'
  const [sortBy, setSortBy] = useState('latest') // 'latest', 'oldest', 'alphabetical'

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchSubscriptions()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user?._id])

  const sortChannels = (channelList, sortOption) => {
    const sorted = [...channelList]
    switch (sortOption) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.fullname?.localeCompare(b.fullname) || 0)
      case 'oldest':
        return sorted.reverse()
      case 'latest':
      default:
        return sorted
    }
  }

  const fetchSubscriptions = async () => {
    if (!user?._id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      console.log('Fetching subscriptions for user:', user._id)
      const { data } = await api.get(`/subscriptions/subscribed/${user._id}`)
      console.log('Subscriptions response:', data)
      
      const subscribedChannels = data.data?.docs || []
      const channelList = subscribedChannels.map(sub => sub.channel).filter(Boolean)
      
      // Sort channels based on selected option
      const sortedChannels = sortChannels(channelList, sortBy)
      setChannels(sortedChannels)

      if (subscribedChannels.length > 0) {
        const channelIds = subscribedChannels.map(sub => sub.channel?._id).filter(Boolean)
        const videoPromises = channelIds.map(channelId =>
          api.get('/videos', { params: { userId: channelId, limit: 5, sortBy: 'createdAt', sortType: 'desc' } })
        )
        const videoResponses = await Promise.all(videoPromises)
        const allVideos = videoResponses.flatMap(res => res.data.data?.docs || [])
        allVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setVideos(allVideos.slice(0, 30))
      } else {
        setVideos([])
      }
    } catch (err) {
      console.error('Subscription fetch error:', err)
      const msg = err.response?.data?.message || 'Failed to load subscriptions'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (channels.length > 0) {
      setChannels(prev => sortChannels(prev, sortBy))
    }
  }, [sortBy])

  const handleUnsubscribe = async (channelId) => {
    try {
      await api.post(`/subscriptions/toggle/${channelId}`)
      setChannels(prev => prev.filter(ch => ch._id !== channelId))
      setVideos(prev => prev.filter(v => v.owner?._id !== channelId))
      toast.success('Unsubscribed successfully')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to unsubscribe'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Flame className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign in to view subscriptions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Subscribe to channels to see their latest videos here
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Subscriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {channels.length > 0 ? `${channels.length} channels` : 'No subscriptions yet'}
              </p>
            </div>
          </div>

          {/* View Controls */}
          {channels.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('videos')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'videos'
                      ? 'bg-white dark:bg-gray-700 text-red-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('channels')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'channels'
                      ? 'bg-white dark:bg-gray-700 text-red-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No subscriptions yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Subscribe to channels to see their videos here
          </p>
          <Link
            to="/trending"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Browse Channels
          </Link>
        </div>
      ) : (
        <>
          {/* Channels Grid View */}
          {viewMode === 'channels' && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Your Subscriptions ({channels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {channels.map((channel) => (
                  <motion.div
                    key={channel._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all"
                  >
                    <Link to={`/channel/${channel.username}`} className="flex flex-col items-center text-center">
                      <img
                        src={channel.avatar}
                        alt={channel.fullname}
                        className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-gray-200 dark:border-gray-700"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 mb-1">
                        {channel.fullname}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        @{channel.username}
                      </p>
                    </Link>
                    <div className="flex gap-2 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUnsubscribe(channel._id)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Unsubscribe
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Notification settings"
                      >
                        <Bell size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Channels List */}
          {viewMode === 'videos' && channels.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Your Subscriptions ({channels.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                {channels.map((channel) => (
                  <motion.div
                    key={channel._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                  >
                    <Link to={`/channel/${channel.username}`} className="flex items-center gap-3">
                      <img
                        src={channel.avatar}
                        alt={channel.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 truncate">
                          {channel.fullname}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{channel.username}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-1 ml-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUnsubscribe(channel._id)}
                        className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap"
                      >
                        Unsubscribe
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {viewMode === 'videos' && videos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Latest Videos
              </h2>
              <div className="video-grid">
                {videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={`/video/${video._id}`} className="block">
                      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black bg-opacity-50 rounded-full p-3">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <img
                          src={video.owner?.avatar}
                          alt={video.owner?.fullname}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {video.owner?.fullname}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {formatViews(video.views)} views
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Subscriptions

