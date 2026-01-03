import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Edit, Trash2, Eye, Upload as UploadIcon, Globe, Lock } from 'lucide-react'

const MyVideos = () => {
  const { user, requireAuth } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const canLoad = useMemo(() => !!user?._id, [user])

  useEffect(() => {
    if (!canLoad) return
    fetchMyVideos(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad])

  const fetchMyVideos = async (pageToLoad = page, reset = false) => {
    requireAuth(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/videos', {
          params: { page: pageToLoad, limit: 12, sortBy: 'createdAt', sortType: 'desc', userId: user._id },
        })
        const docs = data.data?.docs || []
        setVideos(prev => (reset ? docs : [...prev, ...docs]))
        setPage(pageToLoad)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load your videos')
      } finally {
        setLoading(false)
      }
    })
  }

  const startEdit = (v) => {
    setEditingId(v._id)
    setEditTitle(v.title)
    setEditDescription(v.description)
  }

  const saveEdit = async () => {
    requireAuth(async () => {
      try {
        if (!editingId) return
        await api.patch(`/videos/${editingId}`, { title: editTitle, description: editDescription })
        toast.success('Video updated')
        setVideos(prev => prev.map(v => (v._id === editingId ? { ...v, title: editTitle, description: editDescription } : v)))
        setEditingId(null)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Update failed')
      }
    })
  }

  const togglePublish = async (id) => {
    requireAuth(async () => {
      try {
        const { data } = await api.patch(`/videos/toggle/publish/${id}`)
        const updated = data.data
        toast.success(updated.isPublished ? 'Published' : 'Unpublished')
        setVideos(prev => prev.map(v => (v._id === id ? { ...v, isPublished: updated.isPublished } : v)))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Toggle failed')
      }
    })
  }

  const deleteVideo = async (id) => {
    requireAuth(async () => {
      if (!confirm('Delete this video? This cannot be undone.')) return
      try {
        await api.delete(`/videos/${id}`)
        toast.success('Video deleted')
        setVideos(prev => prev.filter(v => v._id !== id))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Delete failed')
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            My Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your uploaded content
          </p>
        </div>
        <Link to="/upload">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl font-medium"
          >
            <UploadIcon size={18} /> Upload New
          </motion.button>
        </Link>
      </motion.div>

      {/* Edit Modal */}
      {editingId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl"
        >
          <h2 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            ✏️ Edit Video
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Video title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Video description..."
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveEdit}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                💾 Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditingId(null)}
                className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {videos.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-5xl mb-6 shadow-2xl"
          >
            🎬
          </motion.div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No videos yet
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Upload your first video to get started
          </p>
          <Link to="/upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg font-medium"
            >
              <UploadIcon size={18} /> Upload Now
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((v, index) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            {/* Thumbnail */}
            <Link to={`/video/${v._id}`} className="block relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {v.thumbnail && (
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              )}
              {/* Status Badge */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                {v.isPublished ? (
                  <div className="flex items-center gap-1.5 bg-green-500/90 text-white">
                    <Globe size={12} /> Published
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-gray-800/90 text-white">
                    <Lock size={12} /> Unpublished
                  </div>
                )}
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Eye size={40} className="text-white" />
              </div>
            </Link>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-base group-hover:text-red-500 transition-colors">
                {v.title}
              </h3>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startEdit(v)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
                >
                  <Edit size={13} /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePublish(v._id)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg shadow-md transition-all ${
                    v.isPublished
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {v.isPublished ? (
                    <>
                      <Lock size={13} /> Unpublish
                    </>
                  ) : (
                    <>
                      <Globe size={13} /> Publish
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteVideo(v._id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-all"
                >
                  <Trash2 size={13} /> Delete
                </motion.button>
                <Link to={`/video/${v._id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-md transition-all"
                  >
                    <Eye size={13} /> View
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            disabled={loading}
            onClick={() => fetchMyVideos(page + 1)}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Loading...' : '📥 Load More'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default MyVideos
