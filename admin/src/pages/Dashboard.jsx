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
  TrendingDown,
  Activity,
  BarChart3,
  Clock,
  Play,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  Star,
  Flame,
  Heart,
  MessageCircle,
  Share2,
  Award,
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
  LineChart,
  Line,
  AreaChart,
  Area,
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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-white/80 mb-2">Loading Dashboard</p>
          <p className="text-sm text-white/40">Fetching your analytics...</p>
        </div>
      </div>
    );
  }

  const videoData = stats
    ? [
        { name: 'Published', value: stats.videos.published },
        { name: 'Unpublished', value: stats.videos.unpublished },
      ]
    : [];

  const CHART_COLORS = ['#6366f1', '#ec4899'];

  // Mock trending data for area chart
  const trendingData = [
    { time: 'Mon', views: 2400, likes: 240, subs: 50 },
    { time: 'Tue', views: 1398, likes: 139, subs: 35 },
    { time: 'Wed', views: 9800, likes: 980, subs: 120 },
    { time: 'Thu', views: 3908, likes: 390, subs: 65 },
    { time: 'Fri', views: 4800, likes: 480, subs: 88 },
    { time: 'Sat', views: 3800, likes: 380, subs: 72 },
    { time: 'Sun', views: 4300, likes: 430, subs: 95 },
  ];

  return (
    <div className="flex-1 min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full px-8 py-8 space-y-8">
        {/* Header with Glassmorphism */}
        <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-sm text-white/60 ml-14">Monitor your platform's performance in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-semibold text-green-300">Live</span>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {stats && (
          <>
            {/* Hero Insight Card */}
            <section>
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                
                {/* Card */}
                <div className="relative backdrop-blur-xl bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                        <div className="relative p-4 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl">
                          <Flame className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                          <h3 className="text-2xl font-bold text-white">Platform Growing Strong! 🚀</h3>
                        </div>
                        <p className="text-base text-white/80">
                          You gained{' '}
                          <span className="font-bold text-green-300 bg-green-400/20 px-2 py-0.5 rounded-lg">
                            +{stats.users.recentWeek} new users
                          </span>{' '}
                          and{' '}
                          <span className="font-bold text-blue-300 bg-blue-400/20 px-2 py-0.5 rounded-lg">
                            +{stats.videos.recentWeek} new videos
                          </span>{' '}
                          this week
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 rounded-xl backdrop-blur-sm shadow-lg shadow-green-500/20">
                      <TrendingUp className="w-5 h-5 text-green-300" strokeWidth={3} />
                      <span className="text-base font-bold text-green-200">Trending Up</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Key Metrics Section - Modern Cards */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Key Performance Indicators</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users - Enhanced */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 hover:border-indigo-400/50 transition-all hover:transform hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-40"></div>
                        <div className="relative p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                          <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/30">
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>12.5%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Total Users</p>
                      <h3 className="text-4xl font-black text-white mb-3 tracking-tight">
                        {stats.users.total.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-green-400 font-semibold mt-2">+{stats.users.recentWeek} this week</p>
                    </div>
                  </div>
                </div>

                {/* Total Videos - Enhanced */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-pink-500 to-rose-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-linear-to-br from-pink-500/10 to-rose-500/10 border border-white/10 rounded-2xl p-6 hover:border-pink-400/50 transition-all hover:transform hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-pink-500 rounded-xl blur-lg opacity-40"></div>
                        <div className="relative p-3 bg-linear-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                          <Video className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/30">
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>8.3%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Total Videos</p>
                      <h3 className="text-4xl font-black text-white mb-3 tracking-tight">
                        {stats.videos.total.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-linear-to-r from-pink-500 to-rose-600 rounded-full" style={{ width: '62%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-green-400 font-semibold mt-2">+{stats.videos.recentWeek} this week</p>
                    </div>
                  </div>
                </div>

                {/* Total Views - Enhanced */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/50 transition-all hover:transform hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-40"></div>
                        <div className="relative p-3 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                          <Eye className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/30">
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>24.7%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Total Views</p>
                      <h3 className="text-4xl font-black text-white mb-3 tracking-tight">
                        {stats.engagement.totalViews.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-linear-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-cyan-400 font-semibold mt-2">Lifetime engagement</p>
                    </div>
                  </div>
                </div>

                {/* Total Likes - Enhanced */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-orange-500 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-linear-to-br from-orange-500/10 to-amber-500/10 border border-white/10 rounded-2xl p-6 hover:border-orange-400/50 transition-all hover:transform hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-40"></div>
                        <div className="relative p-3 bg-linear-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                          <Heart className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/30">
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>18.2%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Total Likes</p>
                      <h3 className="text-4xl font-black text-white mb-3 tracking-tight">
                        {stats.engagement.totalLikes.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-linear-to-r from-orange-500 to-amber-600 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-orange-400 font-semibold mt-2">User appreciation</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Overview Section - Modern */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
              </div>
              <div className="grid grid-cols-12 gap-6">
                {/* Admin Users */}
                <div className="col-span-12 md:col-span-4 group">
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-linear-to-br from-purple-500 to-fuchsia-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/60 mb-1">Admin Users</p>
                        <h3 className="text-3xl font-black text-white">{stats.users.admins}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Published Videos */}
                <div className="col-span-12 md:col-span-4 group">
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white/60">Published Videos</p>
                          <span className="text-xs font-bold text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                            {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stats.videos.published}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="col-span-12 md:col-span-4 group">
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/60 mb-1">Total Subscriptions</p>
                        <h3 className="text-3xl font-black text-white">{stats.engagement.totalSubscriptions}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Analytics Section with Glassmorphism Charts */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Content & Engagement Analytics</h2>
              </div>
              <div className="grid grid-cols-12 gap-6">
                {/* Video Status Chart with Modern Design */}
                <div className="col-span-12 lg:col-span-7 relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-indigo-400/50 transition-all shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <Video className="w-5 h-5 text-indigo-400" />
                          Video Status Distribution
                        </h3>
                        <p className="text-sm text-white/50">Content distribution overview</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
                          <span className="text-sm font-medium text-white/70">Published</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50"></div>
                          <span className="text-sm font-medium text-white/70">Unpublished</span>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <defs>
                          <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="colorUnpublished" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <Pie
                          data={videoData}
                          cx="50%"
                          cy="50%"
                          innerRadius={85}
                          outerRadius={135}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {videoData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? "url(#colorPublished)" : "url(#colorUnpublished)"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                          }}
                          itemStyle={{
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-12 mt-6 pt-6 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-3xl font-black text-white mb-2">{stats.videos.published}</p>
                        <p className="text-sm text-white/50 font-medium">Published</p>
                      </div>
                      <div className="h-16 w-px bg-white/10"></div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-white mb-2">{stats.videos.unpublished}</p>
                        <p className="text-sm text-white/50 font-medium">Unpublished</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Chart with Area Chart */}
                <div className="col-span-12 lg:col-span-5 relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/50 transition-all shadow-2xl">
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Platform Engagement
                      </h3>
                      <p className="text-sm text-white/50">User activity metrics</p>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[
                          { name: 'Views', value: stats.engagement.totalViews, color: '#06b6d4' },
                          { name: 'Likes', value: stats.engagement.totalLikes, color: '#8b5cf6' },
                          { name: 'Subs', value: stats.engagement.totalSubscriptions, color: '#ec4899' },
                        ]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#0891b2" stopOpacity={0.6}/>
                          </linearGradient>
                          <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6}/>
                          </linearGradient>
                          <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#db2777" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff"
                          tick={{ fill: '#ffffff80', fontSize: 13, fontWeight: '600' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          stroke="#ffffff"
                          tick={{ fill: '#ffffff80', fontSize: 12, fontWeight: '600' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                          }}
                          itemStyle={{
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          formatter={(value) => value.toLocaleString()}
                        />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                          {[0, 1, 2].map((index) => (
                            <Cell key={`cell-${index}`} fill={`url(#barGradient${index + 1})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* Weekly Performance Section - Modern Cards */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Weekly Performance</h2>
              </div>
              <div className="grid grid-cols-12 gap-6">
                {/* Weekly New Users */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-400/50 transition-all hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                        <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold text-blue-300 bg-blue-400/20 px-3 py-1.5 rounded-full border border-blue-400/30">
                        Weekly
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">New Users</p>
                      <h3 className="text-4xl font-black text-white">{stats.users.recentWeek}</h3>
                      <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                        <ArrowUp className="w-3 h-3" />
                        <span className="font-semibold">+15% from last week</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly New Videos */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-400/50 transition-all hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                        <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold text-purple-300 bg-purple-400/20 px-3 py-1.5 rounded-full border border-purple-400/30">
                        Weekly
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">New Videos</p>
                      <h3 className="text-4xl font-black text-white">{stats.videos.recentWeek}</h3>
                      <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                        <ArrowUp className="w-3 h-3" />
                        <span className="font-semibold">+8% from last week</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publication Rate */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-400/50 transition-all hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
                        <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-400/20 px-3 py-1.5 rounded-full border border-emerald-400/30">
                        Active
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Publication Rate</p>
                      <h3 className="text-4xl font-black text-white">
                        {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%
                      </h3>
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avg Engagement */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 group relative">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-400/50 transition-all hover:scale-105 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-linear-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
                        <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold text-orange-300 bg-orange-400/20 px-3 py-1.5 rounded-full border border-orange-400/30">
                        Average
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-2">Likes per Video</p>
                      <h3 className="text-4xl font-black text-white">
                        {stats.videos.published > 0 ? (stats.engagement.totalLikes / stats.videos.published).toFixed(0) : 0}
                      </h3>
                      <div className="mt-3 flex items-center gap-1 text-xs text-orange-400">
                        <Star className="w-3 h-3 fill-orange-400" />
                        <span className="font-semibold">Great engagement!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity Panel - Modern Design */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Recent Platform Activity</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500/30 to-emerald-500/30 border border-green-400/40 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-sm font-bold text-green-300">Live Feed</span>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-15 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-400/40 transition-all shadow-2xl">
                  <div className="divide-y divide-white/5">
                    {/* Activity Item 1 - New Video */}
                    <div className="p-6 hover:bg-white/5 transition-all group/item">
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative p-3 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                            <Play className="w-6 h-6 text-white fill-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">New Video Published</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs font-medium text-white/50">2 minutes ago</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-1 mb-2">
                            "Advanced React Patterns 2024" uploaded by <span className="text-indigo-400 font-semibold">@JohnDev</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md font-semibold border border-emerald-400/20">
                              Tutorial
                            </span>
                            <span className="text-xs text-white/40">1.2K views</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-400/20 px-3 py-2 rounded-xl border border-emerald-400/30">
                            <Zap className="w-3.5 h-3.5" />
                            Live
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Item 2 - New User */}
                    <div className="p-6 hover:bg-white/5 transition-all group/item">
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <Users className="w-6 h-6 text-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">New User Registered</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs font-medium text-white/50">5 minutes ago</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-1">
                            <span className="text-indigo-400 font-semibold">@AlexCoder</span> joined the platform
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="text-sm font-bold text-indigo-300 bg-indigo-400/20 px-3 py-2 rounded-xl border border-indigo-400/30">
                            +{stats.users.recentWeek}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Item 3 - High Engagement */}
                    <div className="p-6 hover:bg-white/5 transition-all group/item">
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <div className="absolute inset-0 bg-pink-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative p-3 bg-linear-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                            <Heart className="w-6 h-6 text-white fill-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">High Engagement Alert</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs font-medium text-white/50">12 minutes ago</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-1 mb-2">
                            "JavaScript Masterclass" reached <span className="text-pink-400 font-bold">10K likes</span> milestone
                          </p>
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                            <span className="text-xs text-pink-400 font-semibold">10,000 likes</span>
                            <span className="text-xs text-white/30">•</span>
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs text-cyan-400 font-semibold">45K views</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-300 bg-pink-400/20 px-3 py-2 rounded-xl border border-pink-400/30">
                            <Award className="w-3.5 h-3.5" />
                            Milestone
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Item 4 - Trending */}
                    <div className="p-6 hover:bg-white/5 transition-all group/item">
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                            <Flame className="w-6 h-6 text-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">Trending Content</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs font-medium text-white/50">18 minutes ago</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-1 mb-2">
                            "Next.js 15 Deep Dive" is trending with <span className="text-amber-400 font-bold">5.2K views</span> today
                          </p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs text-amber-400 font-semibold">+320% growth</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-400/20 px-3 py-2 rounded-xl border border-amber-400/30">
                            <Flame className="w-3.5 h-3.5" />
                            Trending
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Item 5 - New Subscription */}
                    <div className="p-6 hover:bg-white/5 transition-all group/item">
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative p-3 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                            <Share2 className="w-6 h-6 text-white" strokeWidth={2} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-white">Channel Milestone</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs font-medium text-white/50">32 minutes ago</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-1">
                            <span className="text-cyan-400 font-semibold">@DevMaster</span> gained <span className="text-cyan-400 font-bold">150 new subscribers</span> today
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="text-sm font-bold text-cyan-300 bg-cyan-400/20 px-3 py-2 rounded-xl border border-cyan-400/30">
                            +150
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
