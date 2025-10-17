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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Videos</h1>
        <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <UploadIcon size={18} /> Upload new
        </Link>
      </div>

      {editingId && (
        <div className="mb-6 p-4 border rounded-lg  bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold  mb-3">Edit video</h2>
          <div className="space-y-3">
            <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
            <textarea className="input min-h-[120px]" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description" />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-4 py-2 bg-red-600 text-white rounded-lg">Save</button>
              <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {videos.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">No videos yet. Upload your first video.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <div key={v._id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            <Link to={`/video/${v._id}`} className="block relative aspect-video bg-gray-200 dark:bg-gray-700">
              {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />}
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-black/70 text-white">
                {v.isPublished ? (<><Globe size={12} /> Published</>) : (<><Lock size={12} /> Unpublished</>)}
              </div>
            </Link>
            <div className="p-3 space-y-2">
              <h3 className="font-semibold line-clamp-2">{v.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => startEdit(v)} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-500 dark:bg-gray-700"><Edit size={14} /> Edit</button>
                <button onClick={() => togglePublish(v._id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-500 dark:bg-gray-700">
                  {v.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteVideo(v._id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-red-600 text-white"><Trash2 size={14} /> Delete</button>
                <Link to={`/video/${v._id}`} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-500 dark:bg-gray-700"><Eye size={14} /> View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length > 0 && (
        <div className="flex justify-center mt-8">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading} onClick={() => fetchMyVideos(page + 1)} className="px-6 py-3 bg-gray-500 dark:bg-gray-700 rounded-lg disabled:opacity-50">
            {loading ? 'Loading…' : 'Load more'}
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default MyVideos
