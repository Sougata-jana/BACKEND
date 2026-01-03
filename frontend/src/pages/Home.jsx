import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { Play, Eye, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/videos', {
        params: {
          page,
          limit: 12,
          sortBy: 'createdAt',
          sortType: 'desc'
        }
      })
      
      if (page === 1) {
        setVideos(response.data.data.docs)
      } else {
        setVideos(prev => [...prev, ...response.data.data.docs])
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Failed to load videos')
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
    <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 w-full overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gradient mb-2 sm:mb-3">
          Welcome to BuzzTube
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
          Discover amazing videos from creators around the world ✨
        </p>
      </div>

      {/* Videos Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group card-hover"
          >
            <Link to={`/video/${video._id}`} className="block touch-manipulation">
              {/* Video Thumbnail - Mobile Optimized */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 shadow-md active:shadow-lg active:scale-[0.98] transition-all duration-200">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Duration badge - Mobile Optimized */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg"
                >
                  {formatDuration(video.duration)}
                </motion.div>

                {/* Play button overlay - Hidden on mobile, visible on hover for desktop */}
                <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-red-600 rounded-full p-4 shadow-2xl"
                  >
                    <Play className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                </div>
              </div>

              {/* Video Info - Mobile Optimized */}
              <div className="flex space-x-2 sm:space-x-3">
                {/* Channel Avatar - Mobile Optimized */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <img
                    src={video.owner?.avatar}
                    alt={video.owner?.fullname}
                    loading="lazy"
                    className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0 border-2 border-transparent group-hover:border-red-500 transition-colors duration-300"
                  />
                </motion.div>

                {/* Video Details - Mobile Optimized */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-pink-600 transition-all duration-300 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 sm:mt-1.5 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors truncate">
                    {video.owner?.fullname}
                  </p>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5">
                    <span className="flex items-center font-semibold">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      {formatViews(video.views)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      {formatTimeAgo(video.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load More Button - Mobile Optimized */}
      {videos.length > 0 && (
        <div className="flex justify-center mt-8 sm:mt-12 lg:mt-16 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setPage(prev => prev + 1)
              fetchVideos()
            }}
            disabled={loading}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 btn-gradient text-black dark:text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm sm:text-base shadow-xl touch-manipulation active:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </div>
            ) : 'Load More Videos'}
          </motion.button>
        </div>
      )}

      {/* Empty State - Mobile Optimized */}
      {!loading && videos.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16 lg:py-20 px-4"
        >
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32">
              <Play className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
            No videos found
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Be the first to upload a video!
          </p>
          <Link
            to="/upload"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 btn-gradient text-white rounded-xl font-bold text-sm sm:text-base shadow-lg touch-manipulation active:shadow-xl"
          >
            Upload Video
          </Link>
        </motion.div>
      )}
    </div>
  )
}

export default Home
