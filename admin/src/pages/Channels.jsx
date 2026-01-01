import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Users,
  Search,
  UserCheck,
  Video,
  Eye,
  Trash2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Calendar,
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
    <div className="flex-1 overflow-auto bg-[#0A0F1E] ml-72 p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col space-y-8">
        
        {/* Header Section */}
        <section className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">Channel Management</h1>
            <p className="text-[#9CA3AF] text-base">Manage all channels and users</p>
          </div>

          {/* Control Bar */}
          <div className="bg-[#111936] rounded-xl p-5 border border-white/10">
            <form onSubmit={handleSearch} className="flex gap-4">
              {/* Search - Dominant */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username, name, or email..."
                  className="w-full h-11 pl-4 pr-11 bg-[#0F172A] border border-white/10 rounded-lg text-[#E5E7EB] placeholder:text-[#64748B] text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" strokeWidth={2} />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 h-11 bg-[#0F172A] border border-white/10 rounded-lg text-[#E5E7EB] text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
              >
                <option value="subscribers">Most Subscribers</option>
                <option value="videos">Most Videos</option>
                <option value="views">Most Views</option>
                <option value="createdAt">Newest</option>
              </select>

              <button
                type="submit"
                className="px-6 h-11 bg-[#6366F1] text-white rounded-lg font-medium hover:bg-[#5558E3] transition-all text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* User List Section */}
        {loading && !channels ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading channels..." />
          </div>
        ) : channels && channels.channels && channels.channels.length > 0 ? (
          <>
            <section className="space-y-3">
              {channels.channels.map((channel) => (
                <div
                  key={channel._id}
                  className="bg-[#111936] rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-6 p-5">
                    
                    {/* Avatar + User Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                        />
                        {channel.isAdmin && (
                          <div className="absolute -bottom-1 -right-1 bg-[#6366F1] p-1 rounded-full border-2 border-[#111936]">
                            <Shield className="w-3 h-3 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-[#E5E7EB] truncate">{channel.fullname}</h3>
                          {channel.isAdmin && (
                            <span className="bg-[#6366F1]/20 text-[#6366F1] text-xs px-2 py-0.5 rounded font-semibold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#9CA3AF]">@{channel.username}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="w-3 h-3 text-[#64748B]" strokeWidth={2} />
                          <p className="text-xs text-[#64748B] truncate">{channel.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="hidden lg:flex items-center gap-8">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <UserCheck className="w-4 h-4 text-[#6366F1]" strokeWidth={2} />
                          <span className="text-sm font-semibold text-[#E5E7EB]">
                            {formatNumber(channel.subscribersCount)}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">Subscribers</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Video className="w-4 h-4 text-[#7C7CFF]" strokeWidth={2} />
                          <span className="text-sm font-semibold text-[#E5E7EB]">
                            {channel.videosCount}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">Videos</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye className="w-4 h-4 text-[#22C55E]" strokeWidth={2} />
                          <span className="text-sm font-semibold text-[#E5E7EB]">
                            {formatNumber(channel.totalViews)}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">Views</p>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{new Date(channel.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAdmin(channel._id, channel.isAdmin)}
                        disabled={actionLoading === channel._id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${
                          channel.isAdmin
                            ? 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20'
                            : 'border-[#6366F1]/30 bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1]/20'
                        }`}
                      >
                        {actionLoading === channel._id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            {channel.isAdmin ? (
                              <>
                                <ShieldOff className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Remove</span>
                              </>
                            ) : (
                              <>
                                <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Make Admin</span>
                              </>
                            )}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(channel._id)}
                        disabled={actionLoading === channel._id}
                        className="p-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete user"
                      >
                        {actionLoading === channel._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Pagination */}
            <section className="bg-[#111936] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#9CA3AF]">
                  Showing <span className="font-semibold text-[#E5E7EB]">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-semibold text-[#E5E7EB]">
                    {Math.min(page * 10, channels.pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold text-[#E5E7EB]">{channels.pagination.total}</span> channels
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 h-9 border border-white/10 rounded-lg hover:bg-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm text-[#E5E7EB]"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, channels.pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg font-medium transition-all text-sm ${
                            page === pageNum
                              ? 'bg-[#6366F1] text-white'
                              : 'border border-white/10 text-[#9CA3AF] hover:bg-[#0F172A] hover:text-[#E5E7EB]'
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
                    className="px-4 h-9 border border-white/10 rounded-lg hover:bg-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm text-[#E5E7EB]"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="text-center py-20 bg-[#111936] rounded-xl border border-white/10">
            <div className="bg-[#6366F1]/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-[#6366F1]" strokeWidth={2} />
            </div>
            <p className="text-[#9CA3AF] text-lg">No channels found</p>
            <p className="text-[#64748B] text-sm mt-2">Try adjusting your search filters</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Channels;
