import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { Play, Eye, Clock, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

const WatchLater = () => {
  const { user, isAuthenticated, requireAuth } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchLater()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchWatchLater = async () => {
    requireAuth(async () => {
      try {
        setLoading(true)
        const response = await api.get('/user/watch-history')
        const historyVideos = response.data.data || []
        setVideos(historyVideos)
      } catch (error) {
        console.error('Error fetching watch later:', error)
        toast.error('Failed to load watch later videos')
      } finally {
        setLoading(false)
      }
    })
  }

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M'
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
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

  const formatTimeAgo = (date) => {
    const now = new Date()
    const videoDate = new Date(date)
    const diffInSeconds = Math.floor((now - videoDate) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Bookmark className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign in to view your watch later list
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Save videos to watch later by adding them to your watch history
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
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Watch Later
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Videos you've watched will appear here
        </p>
      </div>

      {videos.length > 0 ? (
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
                        {formatTimeAgo(video.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Bookmark className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            No videos in watch later
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start watching videos and they'll appear here
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Browse Videos
          </Link>
        </div>
      )}
    </div>
  )
}

export default WatchLater

