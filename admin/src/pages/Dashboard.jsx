import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Users,
  Video,
  Eye,
  ThumbsUp,
  UserCheck,
  TrendingUp,
  Activity,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Clock,
  Zap,
  Crown,
  Target,
  Play,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { getDashboardStats, loading } = useAdmin();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500 mx-auto"></div>
            <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const videoData = stats
    ? [
        { name: 'Published', value: stats.videos.published, color: '#22c55e' },
        { name: 'Unpublished', value: stats.videos.unpublished, color: '#eab308' },
      ]
    : [];

  const COLORS = ['#22c55e', '#eab308'];

  return (
    <div className="flex-1 overflow-auto min-h-screen bg-slate-950">
      {/* Premium Dark Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Crown className="w-6 h-6 text-purple-400" />
                </div>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
                Welcome Back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Admin</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Here's what's happening with your platform today
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-300">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 backdrop-blur-xl rounded-xl border border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-400">Live</span>
              </div>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

        {stats && (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
              {/* Total Users */}
              <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +{stats.users.recentWeek}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">{stats.users.total.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Total Videos */}
              <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30">
                      <Video className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +{stats.videos.recentWeek}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">{stats.videos.total.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Total Videos</p>
                  <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Total Views */}
              <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                      <Eye className="w-5 h-5 text-emerald-400" />
                    </div>
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">{stats.engagement.totalViews.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Total Views</p>
                  <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Total Likes */}
              <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-pink-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-pink-500/20 rounded-xl border border-pink-500/30">
                      <ThumbsUp className="w-5 h-5 text-pink-400" />
                    </div>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">{stats.engagement.totalLikes.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Total Likes</p>
                  <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
              {/* Admin Users Card */}
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-4 bg-indigo-500/30 rounded-2xl border border-indigo-400/30">
                    <UserCheck className="w-8 h-8 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-indigo-300 text-sm font-medium mb-1">Admin Users</p>
                    <h3 className="text-4xl font-black text-white">{stats.users.admins}</h3>
                  </div>
                </div>
              </div>

              {/* Published Videos Card */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-4 bg-emerald-500/30 rounded-2xl border border-emerald-400/30">
                    <Play className="w-8 h-8 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-emerald-300 text-sm font-medium mb-1">Published</p>
                    <h3 className="text-4xl font-black text-white">{stats.videos.published}</h3>
                    <span className="text-emerald-400 text-xs font-semibold">
                      {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}% of total
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscriptions Card */}
              <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-4 bg-orange-500/30 rounded-2xl border border-orange-400/30">
                    <TrendingUp className="w-8 h-8 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-orange-300 text-sm font-medium mb-1">Subscriptions</p>
                    <h3 className="text-4xl font-black text-white">{stats.engagement.totalSubscriptions}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Video Status Donut Chart */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-purple-500/30">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Video Status</h2>
                      <p className="text-xs text-gray-500">Content Distribution</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Unpublished</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={videoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {videoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400">{stats.videos.published}</p>
                    <p className="text-xs text-gray-500">Published</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-yellow-400">{stats.videos.unpublished}</p>
                    <p className="text-xs text-gray-500">Unpublished</p>
                  </div>
                </div>
              </div>

              {/* Engagement Bar Chart */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Platform Engagement</h2>
                    <p className="text-xs text-gray-500">User Activity Metrics</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Views', value: stats.engagement.totalViews, fill: '#22c55e' },
                      { name: 'Likes', value: stats.engagement.totalLikes, fill: '#ec4899' },
                      { name: 'Subs', value: stats.engagement.totalSubscriptions, fill: '#f59e0b' },
                    ]}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                      }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Stats - Gradient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weekly Users */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                      <ArrowUpRight className="w-3 h-3" /> Weekly
                    </div>
                  </div>
                  <h3 className="text-5xl font-black text-white mb-2">{stats.users.recentWeek}</h3>
                  <p className="text-blue-200 text-sm font-medium">New Users This Week</p>
                </div>
              </div>

              {/* Weekly Videos */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                      <ArrowUpRight className="w-3 h-3" /> Weekly
                    </div>
                  </div>
                  <h3 className="text-5xl font-black text-white mb-2">{stats.videos.recentWeek}</h3>
                  <p className="text-purple-200 text-sm font-medium">New Videos This Week</p>
                </div>
              </div>

              {/* Publication Rate */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                      <Zap className="w-3 h-3" /> Rate
                    </div>
                  </div>
                  <h3 className="text-5xl font-black text-white mb-2">
                    {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%
                  </h3>
                  <p className="text-emerald-200 text-sm font-medium">Publication Rate</p>
                </div>
              </div>

              {/* Avg Engagement */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                      <Sparkles className="w-3 h-3" /> Avg
                    </div>
                  </div>
                  <h3 className="text-5xl font-black text-white mb-2">
                    {stats.videos.published > 0 ? (stats.engagement.totalLikes / stats.videos.published).toFixed(0) : 0}
                  </h3>
                  <p className="text-orange-200 text-sm font-medium">Avg Likes per Video</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
