import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const History = () => {
  const { isAuthenticated, requireAuth } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    requireAuth(fetchHistory)
  }, [isAuthenticated])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/users/watch-history')
      setVideos(data.data || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load history'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-20 px-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl"
        >
          🔒
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-3">
          Sign in to view history
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your BuzzTube watch history is available after you log in.
        </p>
        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl"
          >
            Go to Login
          </motion.button>
        </Link>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="w-16 h-16 border-4 border-transparent border-t-red-500 border-r-pink-500 rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg"
        >
          <HistoryIcon className="w-7 h-7 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Watch History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Recent videos you watched
          </p>
        </div>
      </motion.div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl"
          >
            📜
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No history yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Watch videos to start building your history
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/video/${video._id}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-64 aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg shrink-0">
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg"
                    >
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </motion.div>
                  </div>
                  {/* Duration Badge (if available) */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                    {video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : '0:00'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-500 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {video.description}
                  </p>
                  
                  {/* Owner Info */}
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={video.owner?.avatar}
                      alt={video.owner?.fullname}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {video.owner?.fullname}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{video.owner?.username}
                      </p>
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-200 dark:border-red-800">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        📅 Watched {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
