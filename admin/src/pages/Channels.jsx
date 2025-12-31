import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Video,
  Eye,
  Trash2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Channels = () => {
  const { getAllChannels, toggleUserAdmin, deleteUser, loading } = useAdmin();
  const [channels, setChannels] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('subscribers');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, [page, sortBy]);

  const fetchChannels = async () => {
    try {
      const data = await getAllChannels({
        page,
        limit: 10,
        search,
        sortBy,
      });
      setChannels(data);
      setError('');
    } catch (err) {
      setError('Failed to load channels');
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchChannels();
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await toggleUserAdmin(userId);
      setSuccess(`Admin status ${currentStatus ? 'removed' : 'granted'} successfully`);
      fetchChannels();
    } catch (err) {
      setError('Failed to update admin status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user? This will delete all their videos and data. This action cannot be undone.'
      )
    ) {
      return;
    }

    setActionLoading(userId);
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      fetchChannels();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-orange-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Channel Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">Manage all channels and users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username, name, or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="subscribers">Most Subscribers</option>
                <option value="videos">Most Videos</option>
                <option value="views">Most Views</option>
                <option value="createdAt">Newest</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}

        {/* Channels Grid */}
        {loading && !channels ? (
          <LoadingSpinner size="lg" text="Loading channels..." />
        ) : channels && channels.channels && channels.channels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {channels.channels.map((channel) => (
                <div
                  key={channel._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 group"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Avatar & Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                        />
                        {channel.isAdmin && (
                          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-full shadow-lg">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-800">{channel.fullname}</h3>
                          {channel.isAdmin && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">@{channel.username}</p>
                        <p className="text-gray-500 text-sm">{channel.email}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <UserCheck className="w-4 h-4" />
                            <span>{formatNumber(channel.subscribersCount)} subscribers</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 font-medium">
                            <Video className="w-4 h-4" />
                            <span>{channel.videosCount} videos</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <Eye className="w-4 h-4" />
                            <span>{formatNumber(channel.totalViews)} views</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Joined {new Date(channel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <button
                        onClick={() => handleToggleAdmin(channel._id, channel.isAdmin)}
                        disabled={actionLoading === channel._id}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                          channel.isAdmin
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                        }`}
                      >
                        {actionLoading === channel._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            {channel.isAdmin ? (
                              <>
                                <ShieldOff className="w-4 h-4" />
                                <span>Remove Admin</span>
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4" />
                                <span>Make Admin</span>
                              </>
                            )}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(channel._id)}
                        disabled={actionLoading === channel._id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === channel._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-bold">
                  {Math.min(page * 10, channels.pagination.total)}
                </span>{' '}
                of <span className="font-bold">{channels.pagination.total}</span> channels
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, channels.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(channels.pagination.totalPages, p + 1))}
                  disabled={page === channels.pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No channels found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channels;
