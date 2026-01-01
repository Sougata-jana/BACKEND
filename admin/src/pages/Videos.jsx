import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Video as VideoIcon,
  Trash2,
  Search,
  Eye,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Videos = () => {
  const { getAllVideos, deleteVideo, loading } = useAdmin();
  const [videos, setVideos] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [page, sortBy, sortType]);

  const fetchVideos = async () => {
    try {
      const data = await getAllVideos({
        page,
        limit: 10,
        search,
        sortBy,
        sortType,
      });
      setVideos(data);
      setError('');
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVideos();
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(videoId);
    try {
      await deleteVideo(videoId);
      setSuccess('Video deleted successfully');
      fetchVideos();
    } catch (err) {
      setError('Failed to delete video');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0A0F1E] p-8 ml-80">
      <div className="w-full">
        {/* Page Header Section */}
        <div className="mb-8">
          {/* Title Area */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 bg-linear-to-br from-[#7C7CFF] to-[#2EE6D6] rounded-2xl shadow-xl shadow-[#7C7CFF]/30">
                <VideoIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Video Management
                </h1>
                <p className="text-sm text-gray-400">Manage and monitor all platform content</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Control Panel */}
          <div className="bg-[#111936] rounded-xl border border-white/10 p-5 mb-6">
            <form onSubmit={handleSearch}>
              <div className="space-y-4">
                {/* Search Input - Dominant Element */}
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                    Search Videos
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search videos by title or description..."
                      className="w-full h-12 pl-4 pr-12 bg-[#0F172A] border border-[#1E293B] rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all outline-none text-[#E5E7EB] placeholder:text-[#64748B] text-sm"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" strokeWidth={2} />
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Sort By */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-12 px-4 bg-[#0F172A] border border-[#1E293B] rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none text-[#E5E7EB] text-sm cursor-pointer"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="views">Views</option>
                      <option value="title">Title</option>
                    </select>
                  </div>

                  {/* Order */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                      Order
                    </label>
                    <select
                      value={sortType}
                      onChange={(e) => setSortType(e.target.value)}
                      className="w-full h-12 px-4 bg-[#0F172A] border border-[#1E293B] rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none text-[#E5E7EB] text-sm cursor-pointer"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  {/* Apply Button */}
                  <div className="sm:pt-7">
                    <button
                      type="submit"
                      className="w-full sm:w-auto h-12 px-6 bg-[#6366F1] text-white rounded-lg font-semibold hover:bg-[#5558E3] transition-colors text-sm whitespace-nowrap"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}

        {/* Videos Grid */}
        {loading && !videos ? (
          <LoadingSpinner size="lg" text="Loading videos..." />
        ) : videos && videos.docs && videos.docs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {videos.docs.map((video) => (
                <div
                  key={video._id}
                  className="bg-[#111936] rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#7C7CFF]/10 transition-all overflow-hidden border border-white/10 hover:border-[#7C7CFF]/30 group"
                >
                  <div className="flex flex-col md:flex-row gap-5 p-5">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-72 h-44 shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </div>
                      {video.isPublished ? (
                        <div className="absolute top-2 left-2 bg-[#22C55E] text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Published
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 bg-[#FACC15] text-black text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                          <XCircle className="w-3.5 h-3.5" />
                          Draft
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#7C7CFF] transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>

                      {/* Owner */}
                      {video.owner && (
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-9 h-9 rounded-full border-2 border-white/10"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{video.owner.fullname}</p>
                            <p className="text-xs text-gray-500">@{video.owner.username}</p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-5 text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{video.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-medium">{video.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 justify-end items-start">
                      <button
                        onClick={() => handleDelete(video._id)}
                        disabled={deleteLoading === video._id}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded-xl hover:bg-[#EF4444]/20 hover:border-[#EF4444]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === video._id ? (
                          <div className="w-4 h-4 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-[#111936] rounded-xl shadow-lg p-6 flex items-center justify-between border border-white/10">
              <div className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-bold text-white">{Math.min(page * 10, videos.totalDocs)}</span> of{' '}
                <span className="font-bold text-white">{videos.totalDocs}</span> videos
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#0A0F1E] border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, videos.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-[#7C7CFF] text-white shadow-lg shadow-[#7C7CFF]/30'
                            : 'bg-[#0A0F1E] border border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(videos.totalPages, p + 1))}
                  disabled={page === videos.totalPages}
                  className="px-4 py-2 bg-[#0A0F1E] border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-[#111936] rounded-xl shadow-lg border border-white/10">
            <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No videos found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
