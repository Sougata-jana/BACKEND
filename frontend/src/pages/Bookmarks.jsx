import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Bookmark, Clock, Tag, Trash2, Play, Video as VideoIcon, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookmarks();
    fetchStats();
    fetchTags();
  }, [selectedTag, page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (selectedTag) params.tag = selectedTag;
      
      const { data } = await api.get('/bookmarks', { params });
      setBookmarks(data.data.bookmarks || []);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/bookmarks/stats');
      setStats(data.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await api.get('/bookmarks/tags');
      setTags(data.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleDelete = async (bookmarkId) => {
    if (!confirm('Delete this bookmark?')) return;
    
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
      toast.success('Bookmark deleted');
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete bookmark');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const groupByVideo = () => {
    const grouped = {};
    bookmarks.forEach(bookmark => {
      const videoId = bookmark.video._id;
      if (!grouped[videoId]) {
        grouped[videoId] = {
          video: bookmark.video,
          bookmarks: []
        };
      }
      grouped[videoId].bookmarks.push(bookmark);
    });
    return Object.values(grouped);
  };

  const groupedBookmarks = groupByVideo();

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Bookmarks
            </h1>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalBookmarks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Bookmarks
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.uniqueVideosCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Videos Bookmarked
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {tags.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Tags
                </div>
              </div>
            </div>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by tag:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !selectedTag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => setSelectedTag(tag.tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag.tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag.tag} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bookmarks */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookmarks yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start bookmarking your favorite video moments!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Play className="w-4 h-4" />
              Explore Videos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBookmarks.map((group) => (
              <motion.div
                key={group.video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                {/* Video Header */}
                <Link
                  to={`/video/${group.video._id}`}
                  className="flex items-start gap-4 p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={group.video.thumbnail}
                    alt={group.video.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {group.video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <VideoIcon className="w-4 h-4" />
                      <span>{group.bookmarks.length} bookmarks</span>
                    </div>
                  </div>
                </Link>

                {/* Bookmarks */}
                <div className="p-4 space-y-2">
                  {group.bookmarks.map((bookmark) => (
                    <div
                      key={bookmark._id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                    >
                      <div
                        className="w-1 h-full rounded-full flex-shrink-0"
                        style={{ backgroundColor: bookmark.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            to={`/video/${group.video._id}?t=${bookmark.timestamp}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {bookmark.title}
                          </Link>
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-mono flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatTime(bookmark.timestamp)}
                          </div>
                        </div>
                        {bookmark.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {bookmark.note}
                          </p>
                        )}
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {bookmark.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(bookmark._id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
