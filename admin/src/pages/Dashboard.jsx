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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-[#9CA3AF]">Loading dashboard...</p>
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

  const CHART_COLORS = ['#22C55E', '#9CA3AF'];

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F19]">
      <div className="w-full px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-sm text-gray-400">Monitor your platform's performance and key metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-white/5 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-white/5 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live</span>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {stats && (
          <>
            {/* Hero Insight Bar */}
            <section>
              <div className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Platform Growing Strong</h3>
                      <p className="text-sm text-gray-400">
                        You gained <span className="text-green-400 font-semibold">{stats.users.recentWeek} new users</span> and{' '}
                        <span className="text-green-400 font-semibold">{stats.videos.recentWeek} new videos</span> this week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <ArrowUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">Trending Up</span>
                  </div>
                </div>
              </div>
            </section>
            {/* Key Metrics Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      <span>12.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Users</p>
                    <h3 className="text-4xl font-bold text-white mb-2">{stats.users.total.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">+{stats.users.recentWeek} this week</p>
                  </div>
                </div>

                {/* Total Videos */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <Video className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      <span>8.3%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Videos</p>
                    <h3 className="text-4xl font-bold text-white mb-2">{stats.videos.total.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">+{stats.videos.recentWeek} this week</p>
                  </div>
                </div>

                {/* Total Views */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <Eye className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      <span>24.7%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Views</p>
                    <h3 className="text-4xl font-bold text-white mb-2">{stats.engagement.totalViews.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">Lifetime engagement</p>
                  </div>
                </div>

                {/* Total Likes */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <ThumbsUp className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      <span>18.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Likes</p>
                    <h3 className="text-4xl font-bold text-white mb-2">{stats.engagement.totalLikes.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">User appreciation</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Overview Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Platform Overview</h2>
              <div className="grid grid-cols-12 gap-6">
                {/* Admin Users */}
                <div className="col-span-12 md:col-span-4 bg-[#111827] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-lg shrink-0">
                      <UserCheck className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Admin Users</p>
                      <h3 className="text-2xl font-bold text-white">{stats.users.admins}</h3>
                    </div>
                  </div>
                </div>

                {/* Published Videos */}
                <div className="col-span-12 md:col-span-4 bg-[#111827] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-lg shrink-0">
                      <Play className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-gray-400">Published Videos</p>
                        <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                          {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{stats.videos.published}</h3>
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="col-span-12 md:col-span-4 bg-[#111827] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-lg shrink-0">
                      <TrendingUp className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Subscriptions</p>
                      <h3 className="text-2xl font-bold text-white">{stats.engagement.totalSubscriptions}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Analytics Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Content & Engagement Analytics</h2>
              <div className="grid grid-cols-12 gap-6">
                {/* Video Status Chart - spans 6 columns */}
                <div className="col-span-12 lg:col-span-6 bg-[#111936] border border-[#7C7CFF]/20 rounded-2xl p-8 hover:border-[#7C7CFF]/40 transition-all shadow-lg shadow-[#7C7CFF]/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Video Status</h3>
                      <p className="text-sm text-gray-400">Content distribution overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-400">Published</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <span className="text-sm text-gray-400">Unpublished</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={videoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {videoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                        itemStyle={{
                          color: '#E5E7EB',
                          fontSize: '14px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">{stats.videos.published}</p>
                      <p className="text-xs text-gray-400">Published</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">{stats.videos.unpublished}</p>
                      <p className="text-xs text-gray-400">Unpublished</p>
                    </div>
                  </div>
                </div>

                {/* Platform Engagement Chart - spans 6 columns */}
                <div className="col-span-12 lg:col-span-6 bg-[#111936] border border-[#2EE6D6]/20 rounded-2xl p-8 hover:border-[#2EE6D6]/40 transition-all shadow-lg shadow-[#2EE6D6]/5">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-1">Platform Engagement</h3>
                    <p className="text-sm text-gray-400">User activity metrics</p>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={[
                        { name: 'Views', value: stats.engagement.totalViews },
                        { name: 'Likes', value: stats.engagement.totalLikes },
                        { name: 'Subscriptions', value: stats.engagement.totalSubscriptions },
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                        itemStyle={{
                          color: '#E5E7EB',
                          fontSize: '14px',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        formatter={(value) => value.toLocaleString()}
                      />
                      <Bar dataKey="value" fill="#7C7CFF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Weekly Performance Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Weekly Performance</h2>
              <div className="grid grid-cols-12 gap-6">
                {/* Weekly New Users */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#111936] border border-white/10 rounded-xl p-6 hover:border-[#7C7CFF]/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Users className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Weekly</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">New Users</p>
                    <h3 className="text-3xl font-bold text-white">{stats.users.recentWeek}</h3>
                  </div>
                </div>

                {/* Weekly New Videos */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#111936] border border-white/10 rounded-xl p-6 hover:border-[#2EE6D6]/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Video className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Weekly</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">New Videos</p>
                    <h3 className="text-3xl font-bold text-white">{stats.videos.recentWeek}</h3>
                  </div>
                </div>

                {/* Publication Rate */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#111936] border border-white/10 rounded-xl p-6 hover:border-[#22C55E]/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded font-semibold">Active</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Publication Rate</p>
                    <h3 className="text-3xl font-bold text-white">
                      {((stats.videos.published / stats.videos.total) * 100).toFixed(0)}%
                    </h3>
                  </div>
                </div>

                {/* Avg Engagement */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#111936] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Activity className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Average</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Likes per Video</p>
                    <h3 className="text-3xl font-bold text-white">
                      {stats.videos.published > 0 ? (stats.engagement.totalLikes / stats.videos.published).toFixed(0) : 0}
                    </h3>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity Panel */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Platform Activity</h2>
                <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-full font-semibold border border-[#22C55E]/30">Live Feed</span>
              </div>
              <div className="bg-[#111936] border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C7CFF]/30 transition-all shadow-lg">
                <div className="divide-y divide-white/5">
                  {/* Activity Item 1 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#22C55E]/10 rounded-lg shrink-0 mt-1 border border-[#22C55E]/20">
                        <Video className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">New Video Published</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">2 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          "Advanced React Patterns 2024" uploaded by @JohnDev
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded font-semibold border border-[#22C55E]/30">
                          <Zap className="w-3 h-3" />
                          Live
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#7C7CFF]/10 rounded-lg shrink-0 mt-1 border border-[#7C7CFF]/20">
                        <Users className="w-5 h-5 text-[#7C7CFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">New User Registered</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">5 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          @AlexCoder joined the platform
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-[#7C7CFF] bg-[#7C7CFF]/10 px-2 py-1 rounded font-semibold border border-[#7C7CFF]/30">
                          +{stats.users.recentWeek}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#2EE6D6]/10 rounded-lg shrink-0 mt-1 border border-[#2EE6D6]/20">
                        <ThumbsUp className="w-5 h-5 text-[#2EE6D6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">High Engagement</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">12 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          "JavaScript Masterclass" reached 10K likes milestone
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-[#2EE6D6] bg-[#2EE6D6]/10 px-2 py-1 rounded font-semibold border border-[#2EE6D6]/30">
                          Milestone
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#FACC15]/10 rounded-lg shrink-0 mt-1 border border-[#FACC15]/20">
                        <TrendingUp className="w-5 h-5 text-[#FACC15]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">Trending Content</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">18 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          "Next.js 15 Deep Dive" is trending with 5.2K views today
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-[#FACC15] bg-[#FACC15]/10 px-2 py-1 rounded font-semibold border border-[#FACC15]/30">
                          Trending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 5 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#22C55E]/10 rounded-lg shrink-0 mt-1 border border-[#22C55E]/20">
                        <Video className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">New Video Published</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">25 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          "CSS Grid Layout Tutorial" uploaded by @SarahDesigns
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded font-medium">
                          New
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 6 */}
                  <div className="p-5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-[#7C7CFF]/10 rounded-lg shrink-0 mt-1 border border-[#7C7CFF]/20">
                        <Users className="w-5 h-5 text-[#7C7CFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">New Subscription</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">32 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          @DevMaster gained 150 new subscribers today
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-[#7C7CFF] bg-[#7C7CFF]/10 px-2 py-1 rounded font-semibold border border-[#7C7CFF]/30">
                          +150
                        </span>
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
