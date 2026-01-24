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
              {query ? (
                <>
                  {loading ? (
                    `Searching for "${query}"...`
                  ) : (
                    <>
                      {results.length > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ✓ Found {results.length} video{results.length > 1 ? 's' : ''} for "{query}"
                        </span>
                      ) : (
                        `No results for "${query}"`
                      )}
                    </>
                  )}
                </>
              ) : (
                'Enter a search term to find videos'
              )}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                <SearchIcon className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3"
            >
              No Videos Found
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-2"
            >
              We couldn't find any videos matching "<span className="font-semibold text-red-600 dark:text-red-400">{query}</span>"
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-500"
            >
              Try searching with different keywords or check your spelling
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Browse All Videos
              </Link>
            </motion.div>
          </motion.div>
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
