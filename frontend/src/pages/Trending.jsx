import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { Play, Eye, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const Trending = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchTrendingVideos()
  }, [])

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/videos', {
        params: {
          page: 1,
          limit: 24,
          sortBy: 'views',
          sortType: 'desc'
        }
      })
      setVideos(response.data.data.docs || [])
    } catch (error) {
      console.error('Error fetching trending videos:', error)
      toast.error('Failed to load trending videos')
    } finally {
      setLoading(false)
    }
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

  if (loading && videos.length === 0) {
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
          <TrendingUp className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Trending
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          The most popular videos on BuzzTube right now
        </p>
      </div>

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

      {!loading && videos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            No trending videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for trending content!
          </p>
        </div>
      )}
    </div>
  )
}

export default Trending

