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
      const { data } = await api.get('/user/watch-history')
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
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in to view history</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your BuzzTube watch history is available after you log in.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-lg bg-red-600 text-white inline-block">Go to login</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Watch History</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Recent videos you watched.</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <HistoryIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No history yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Watch videos to start your history.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`} className="flex gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
              <div className="relative w-48 aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded">
                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{video.description}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Watched {new Date(video.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <img src={video.owner?.avatar} alt={video.owner?.fullname} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">@{video.owner?.username}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
