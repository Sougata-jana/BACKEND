import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { 
  BarChart3, 
  Eye, 
  Users, 
  ThumbsUp, 
  Video, 
  TrendingUp,
  Calendar,
  Play,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return (views || 0).toString()
}

const formatDuration = (seconds) => {
  // Round to whole seconds to remove decimals
  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const Dashboard = () => {
  const { user, isAuthenticated, requireAuth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState(28)

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, period])

  const fetchStats = async () => {
    requireAuth(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/dashboard/stats', {
          params: { days: period }
        })
        setStats(data.data)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load stats'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign in to view dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Track your channel performance and analytics
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Channel Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your channel's performance and growth
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={28}>Last 28 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Views */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {formatViews(stats?.totalViews || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Views</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +{formatViews(stats?.recentViews || 0)} in last {period} days
            </p>
          </motion.div>

          {/* Subscribers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {(stats?.totalSubscribers || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subscribers</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +{stats?.newSubscribers || 0} in last {period} days
            </p>
          </motion.div>

          {/* Total Likes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {formatViews(stats?.totalLikes || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Likes</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +{stats?.recentLikes || 0} in last {period} days
            </p>
          </motion.div>

          {/* Total Videos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.totalVideos || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Videos</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {stats?.publishedVideos || 0} published
            </p>
          </motion.div>
        </div>

        {/* Top Performing Videos */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Top Performing Videos
            </h2>
          </div>

          {stats?.topVideos && stats.topVideos.length > 0 ? (
            <div className="space-y-4">
              {stats.topVideos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-shrink-0 text-2xl font-bold text-gray-400 w-8">
                    #{index + 1}
                  </div>
                  <Link to={`/video/${video._id}`} className="flex-shrink-0">
                    <div className="relative w-32 h-18 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 line-clamp-2">
                        {video.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatViews(video.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No videos yet. Upload your first video!
            </p>
          )}
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Subscribers
            </h2>
          </div>

          {stats?.recentSubscribersList && stats.recentSubscribersList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentSubscribersList.map((sub, index) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                >
                  <Link to={`/channel/${sub.subscriber?.username}`}>
                    <img
                      src={sub.subscriber?.avatar}
                      alt={sub.subscriber?.fullname}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/channel/${sub.subscriber?.username}`}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 truncate">
                        {sub.subscriber?.fullname}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{sub.subscriber?.username}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No subscribers yet
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Grow Your Channel</h2>
          <p className="mb-6 opacity-90">
            Upload more videos, engage with your audience, and watch your channel grow!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              Upload Video
            </Link>
            <Link
              to="/my-videos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              <Video className="w-5 h-5" />
              My Videos
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
