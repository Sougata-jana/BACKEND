import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Library as LibraryIcon, History, ThumbsUp, Video, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const Library = () => {
  const { isAuthenticated, user, requireAuth } = useAuth()
  const [summary, setSummary] = useState({ history: 0, liked: 0, playlists: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    requireAuth(loadSummary)
  }, [isAuthenticated, user?._id])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const [historyRes, likedRes, playlistRes] = await Promise.allSettled([
        api.get('/user/watch-history'),
        api.get('/likes/videos', { params: { limit: 1 } }),
        user?._id ? api.get(`/playlists/user/${user._id}`, { params: { limit: 1 } }) : Promise.resolve({ data: { data: { totalDocs: 0, docs: [] } } })
      ])
      const historyCount = historyRes.status === 'fulfilled' ? (historyRes.value.data?.data?.length || 0) : 0
      const likedCount = likedRes.status === 'fulfilled' ? (likedRes.value.data?.data?.totalDocs ?? likedRes.value.data?.data?.docs?.length ?? 0) : 0
      const playlistCount = playlistRes.status === 'fulfilled' ? (playlistRes.value.data?.data?.totalDocs ?? playlistRes.value.data?.data?.docs?.length ?? 0) : 0
      setSummary({ history: historyCount, liked: likedCount, playlists: playlistCount })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load library'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const items = [
    { icon: History, title: 'History', description: `${summary.history} videos`, link: '/history', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { icon: Video, title: 'Your videos', description: 'Manage your uploads', link: '/my-videos', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { icon: ThumbsUp, title: 'Liked videos', description: `${summary.liked} videos`, link: '/liked', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { icon: List, title: 'Playlists', description: `${summary.playlists} playlists`, link: user?._id ? `/channel/${user._id}` : '/playlist', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Library</h1>
          {loading && <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />}
        </div>

        {!isAuthenticated && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">Sign in to view your BuzzTube library</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">History, playlists and liked videos are saved to your account.</p>
            </div>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-red-600 text-white">Login</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                to={item.link}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default Library
