import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, Clock, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return (views || 0).toString()
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const LikedVideos = () => {
  const { isAuthenticated, requireAuth } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    requireAuth(fetchLiked)
  }, [isAuthenticated])

  const fetchLiked = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/likes/videos', { params: { limit: 30 } })
      const docs = data.data?.docs || []
      const mapped = docs.map((entry) => entry.video).filter(Boolean)
      setVideos(mapped)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load liked videos'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in to view liked videos</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your liked BuzzTube videos will show up here after you log in.</p>
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
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ThumbsUp className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Liked Videos</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Videos you have liked on BuzzTube.</p>
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
            <ThumbsUp className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No liked videos yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Like videos to see them here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye size={14} />
                  {formatViews(video.views)} views
                  <span>•</span>
                  <Clock size={14} />
                  {new Date(video.createdAt).toLocaleDateString()}
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

export default LikedVideos
