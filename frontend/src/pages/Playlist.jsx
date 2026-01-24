import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Play, Clock, Eye } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

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
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const Playlist = () => {
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/playlists/${playlistId}`)
        setPlaylist(data.data)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load playlist'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [playlistId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Playlist not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">This playlist may be private or removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Play className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{playlist.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{playlist.description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{playlist.videos?.length || 0} videos</span>
              {playlist.owner && (
                <span className="inline-flex items-center gap-2">
                  <img src={playlist.owner.avatar} alt={playlist.owner.fullname} className="w-8 h-8 rounded-full object-cover" />
                  @{playlist.owner.username}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {playlist.videos?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlist.videos.map((video, index) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <Link to={`/video/${video._id}`} className="relative w-48 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </Link>
              <div className="flex-1 p-3 space-y-2">
                <Link to={`/video/${video._id}`} className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-400">
                  {video.title}
                </Link>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{video.description}</div>
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No videos in this playlist yet.</div>
      )}
    </div>
  )
}

export default Playlist
