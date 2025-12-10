import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, Clock, Eye, Play } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return (views || 0).toString()
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
  const created = new Date(date)
  const diffInSeconds = Math.floor((now - created) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

const Search = () => {
  const [searchParams] = useSearchParams()
  const query = useMemo(() => searchParams.get('q') || '', [searchParams])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      try {
        setLoading(true)
        const { data } = await api.get('/videos', {
          params: { query, limit: 24, sortBy: 'createdAt', sortType: 'desc' }
        })
        setResults(data.data?.docs || [])
      } catch (err) {
        const msg = err.response?.data?.message || 'Search failed'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [query])

  const showEmpty = !loading && query && results.length === 0

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Search Results</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {query ? `Showing results for "${query}"` : 'Enter a search term to find videos'}
            </p>
          </div>
          {loading && (
            <div className="w-9 h-9 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />
          )}
        </div>

        {!query && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Start typing to search</h3>
            <p className="text-gray-600 dark:text-gray-400">Use the search bar above to find videos on BuzzTube.</p>
          </div>
        )}

        {showEmpty && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try a different search term.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {results.map((video, index) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="flex gap-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <Link to={`/video/${video._id}`} className="relative w-48 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </Link>
              <div className="flex-1 p-3 flex flex-col gap-2">
                <Link to={`/video/${video._id}`} className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-400">
                  {video.title}
                </Link>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{video.description}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={14} />
                    {formatViews(video.views)} views
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    {formatTimeAgo(video.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <img src={video.owner?.avatar} alt={video.owner?.fullname} className="w-8 h-8 rounded-full object-cover" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">@{video.owner?.username}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && results.length > 0 && (
          <div className="flex justify-center py-6">
            <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Search
