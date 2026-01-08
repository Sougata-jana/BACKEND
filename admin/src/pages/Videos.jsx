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
  Play,
  MessageSquare,
  Filter,
  Download,
  ExternalLink,
  X,
  Calendar,
  User,
  BarChart3,
  CheckSquare,
  Square,
  Trash,
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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchVideos();
  }, [page, sortBy, sortType, statusFilter]);

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
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    } catch (err) {
      setError('Failed to delete video');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedVideos.length} video(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const videoId of selectedVideos) {
        await deleteVideo(videoId);
      }
      setSuccess(`${selectedVideos.length} video(s) deleted successfully`);
      setSelectedVideos([]);
      fetchVideos();
    } catch (err) {
      setError('Failed to delete some videos');
    }
  };

  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === videos?.docs?.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos?.docs?.map(v => v._id) || []);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const filteredVideos = videos?.docs?.filter(video => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return video.isPublished;
    if (statusFilter === 'draft') return !video.isPublished;
    return true;
  });

  return (
    <div className="flex-1 overflow-auto bg-[#0A0F1E] p-8 ml-80">
      <div className="w-full max-w-7xl mx-auto">
        {/* Page Header Section */}
        <div className="mb-8">
          {/* Title Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
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
              
              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="bg-[#111936] border border-white/10 rounded-xl px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Total Videos</div>
                  <div className="text-2xl font-bold text-white">{videos?.totalDocs || 0}</div>
                </div>
                <div className="bg-[#111936] border border-white/10 rounded-xl px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Published</div>
                  <div className="text-2xl font-bold text-[#22C55E]">
                    {videos?.docs?.filter(v => v.isPublished).length || 0}
                  </div>
                </div>
                <div className="bg-[#111936] border border-white/10 rounded-xl px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Drafts</div>
                  <div className="text-2xl font-bold text-[#FACC15]">
                    {videos?.docs?.filter(v => !v.isPublished).length || 0}
                  </div>
                </div>
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
                  {/* Status Filter */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-12 px-4 bg-[#0F172A] border border-[#1E293B] rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none text-[#E5E7EB] text-sm cursor-pointer"
                    >
                      <option value="all">All Videos</option>
                      <option value="published">Published Only</option>
                      <option value="draft">Drafts Only</option>
                    </select>
                  </div>
                  
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

          {/* Bulk Actions Bar */}
          {selectedVideos.length > 0 && (
            <div className="bg-[#111936] border border-[#7C7CFF]/50 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-[#7C7CFF]" />
                <span className="text-white font-medium">
                  {selectedVideos.length} video(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedVideos([])}
                  className="px-4 py-2 bg-[#0F172A] border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}

        {/* Videos Grid */}
        {loading && !videos ? (
          <LoadingSpinner size="lg" text="Loading videos..." />
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <>
            {/* Select All Checkbox */}
            <div className="bg-[#111936] border border-white/10 rounded-xl p-4 mb-4 flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                {selectedVideos.length === videos?.docs?.length ? (
                  <CheckSquare className="w-5 h-5 text-[#7C7CFF]" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">Select All</span>
              </button>
              <div className="text-sm text-gray-500">
                ({filteredVideos.length} videos)
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className={`bg-[#111936] rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#7C7CFF]/10 transition-all overflow-hidden border ${
                    selectedVideos.includes(video._id) 
                      ? 'border-[#7C7CFF] ring-2 ring-[#7C7CFF]/30' 
                      : 'border-white/10 hover:border-[#7C7CFF]/30'
                  } group`}
                >
                  <div className="flex flex-col md:flex-row gap-5 p-5">
                    {/* Selection Checkbox */}
                    <div className="flex items-start">
                      <button
                        onClick={() => toggleVideoSelection(video._id)}
                        className="p-1 hover:bg-white/5 rounded transition-colors"
                      >
                        {selectedVideos.includes(video._id) ? (
                          <CheckSquare className="w-5 h-5 text-[#7C7CFF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    {/* Thumbnail with Play Overlay */}
                    <div className="relative w-full md:w-80 h-48 shrink-0 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#7C7CFF] rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </div>
                      
                      {/* Status Badge */}
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
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#7C7CFF] transition-colors line-clamp-2 cursor-pointer"
                          onClick={() => setSelectedVideo(video)}>
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>

                      {/* Owner */}
                      {video.owner && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-[#0F172A] rounded-lg border border-white/5">
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-10 h-10 rounded-full border-2 border-[#7C7CFF]/30"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{video.owner.fullname}</p>
                            <p className="text-xs text-gray-500">@{video.owner.username}</p>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs">Views</span>
                          </div>
                          <p className="text-lg font-bold text-white">{formatNumber(video.views)}</p>
                        </div>
                        
                        <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs">Likes</span>
                          </div>
                          <p className="text-lg font-bold text-white">{formatNumber(video.likesCount || 0)}</p>
                        </div>
                        
                        <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs">Comments</span>
                          </div>
                          <p className="text-lg font-bold text-white">{formatNumber(video.commentsCount || 0)}</p>
                        </div>
                        
                        <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Created</span>
                          </div>
                          <p className="text-xs font-medium text-white">{new Date(video.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 justify-end items-start">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C7CFF]/10 text-[#7C7CFF] border border-[#7C7CFF]/30 rounded-xl hover:bg-[#7C7CFF]/20 hover:border-[#7C7CFF]/50 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(video._id)}
                        disabled={deleteLoading === video._id}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded-xl hover:bg-[#EF4444]/20 hover:border-[#EF4444]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Video"
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
            <div className="bg-[#111936] rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
              <div className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-bold text-white">{Math.min(page * 10, videos.totalDocs)}</span> of{' '}
                <span className="font-bold text-white">{videos.totalDocs}</span> videos
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
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

      {/* Video Details Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-[#111936] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#111936] border-b border-white/10 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Video Details</h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  src={selectedVideo.videoFile}
                  poster={selectedVideo.thumbnail}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{selectedVideo.description}</p>
              </div>

              {/* Owner Info */}
              {selectedVideo.owner && (
                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Channel Owner</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedVideo.owner.avatar}
                      alt={selectedVideo.owner.username}
                      className="w-16 h-16 rounded-full border-2 border-[#7C7CFF]/30"
                    />
                    <div>
                      <p className="text-lg font-semibold text-white">{selectedVideo.owner.fullname}</p>
                      <p className="text-sm text-gray-400">@{selectedVideo.owner.username}</p>
                      {selectedVideo.owner.email && (
                        <p className="text-xs text-gray-500 mt-1">{selectedVideo.owner.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Eye className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase">Views</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedVideo.views.toLocaleString()}</p>
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase">Likes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedVideo.likesCount || 0}</p>
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase">Comments</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedVideo.commentsCount || 0}</p>
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatDuration(selectedVideo.duration)}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                  {selectedVideo.isPublished ? (
                    <div className="inline-flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-3 py-1.5 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Published</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 text-[#FACC15] px-3 py-1.5 rounded-lg">
                      <XCircle className="w-4 h-4" />
                      <span className="font-semibold">Draft</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Created At</p>
                  <p className="text-white font-medium">{new Date(selectedVideo.createdAt).toLocaleString()}</p>
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Video ID</p>
                  <p className="text-white font-mono text-sm break-all">{selectedVideo._id}</p>
                </div>

                <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Last Updated</p>
                  <p className="text-white font-medium">{new Date(selectedVideo.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <a
                  href={selectedVideo.videoFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7C7CFF] text-white rounded-xl hover:bg-[#6B6BEE] transition-colors font-semibold"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Video
                </a>
                <button
                  onClick={() => {
                    handleDelete(selectedVideo._id);
                    setSelectedVideo(null);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#EF4444] text-white rounded-xl hover:bg-[#DC2626] transition-colors font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
