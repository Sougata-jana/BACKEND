import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Eye,
  ThumbsUp,
  Activity,
  Play,
  BarChart3,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const Analytics = () => {
  const { getVideoAnalytics, loading } = useAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [sortBy, setSortBy] = useState('views');
  const [limit, setLimit] = useState(10);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [sortBy, limit]);

  const fetchAnalytics = async () => {
    try {
      const data = await getVideoAnalytics({ sortBy, limit });
      setAnalytics(data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate trends (mock data for demo - replace with real API data)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, direction: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  // Mock trend data (in real app, this comes from API)
  const trends = {
    views: calculateTrend(analytics?.statistics?.totalViews || 0, (analytics?.statistics?.totalViews || 0) * 0.75),
    likes: calculateTrend(analytics?.statistics?.totalLikes || 0, (analytics?.statistics?.totalLikes || 0) * 0.85),
    avgViews: calculateTrend(analytics?.statistics?.avgViews || 0, (analytics?.statistics?.avgViews || 0) * 0.8),
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0A0F1E] ml-72 p-8">
      <div className="max-w-400 mx-auto flex flex-col space-y-12">
        
        {/* Analytics Hero Section */}
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">Video Analytics</h1>
              <p className="text-[#9CA3AF] text-base">Performance insights and metrics</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2 bg-[#111936] rounded-lg p-1.5 border border-white/10">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-[#6366F1] text-white shadow-lg'
                      : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Insight Hero Card */}
          {analytics?.statistics && (
            <div className="bg-linear-to-r from-[#111936] to-[#1a1f3a] rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#7C7CFF]/20 p-2.5 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#7C7CFF]" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#E5E7EB]">Key Insight</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                Views increased {trends.views.value}% this week
              </p>
              <p className="text-[#9CA3AF] text-sm">
                Your content reached {formatNumber(analytics.statistics.totalViews)} views across {analytics.statistics.totalVideos} videos
              </p>
            </div>
          )}
        </section>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {loading && !analytics ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading analytics..." />
          </div>
        ) : !analytics ? (
          <section className="text-center py-20 bg-[#111936] rounded-xl border border-white/10">
            <div className="bg-[#6366F1]/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#6366F1]" strokeWidth={2} />
            </div>
            <p className="text-[#9CA3AF] text-lg">No analytics data available</p>
            <p className="text-[#64748B] text-sm mt-2">Analytics will appear once videos are published</p>
          </section>
        ) : null}

        {/* KPI Cards with Trends */}
        {analytics?.statistics && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Total Views Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#6366F1]/20 p-3 rounded-lg">
                      <Eye className="w-6 h-6 text-[#6366F1]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      trends.views.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.views.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.views.direction === 'up' && <ArrowUp className="w-3 h-3" strokeWidth={3} />}
                      {trends.views.direction === 'down' && <ArrowDown className="w-3 h-3" strokeWidth={3} />}
                      {trends.views.direction === 'neutral' && <Minus className="w-3 h-3" strokeWidth={3} />}
                      {trends.views.value}%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatNumber(analytics.statistics.totalViews)}
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium">Total Views</p>
                  <p className="text-[#64748B] text-xs mt-1">Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days</p>
                </div>

                {/* Total Likes Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#EC4899]/20 p-3 rounded-lg">
                      <ThumbsUp className="w-6 h-6 text-[#EC4899]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      trends.likes.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.likes.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.likes.direction === 'up' && <ArrowUp className="w-3 h-3" strokeWidth={3} />}
                      {trends.likes.direction === 'down' && <ArrowDown className="w-3 h-3" strokeWidth={3} />}
                      {trends.likes.direction === 'neutral' && <Minus className="w-3 h-3" strokeWidth={3} />}
                      {trends.likes.value}%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatNumber(analytics.statistics.totalLikes)}
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium">Total Likes</p>
                  <p className="text-[#64748B] text-xs mt-1">Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days</p>
                </div>

                {/* Avg Views Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#7C7CFF]/20 p-3 rounded-lg">
                      <Activity className="w-6 h-6 text-[#7C7CFF]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      trends.avgViews.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.avgViews.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.avgViews.direction === 'up' && <ArrowUp className="w-3 h-3" strokeWidth={3} />}
                      {trends.avgViews.direction === 'down' && <ArrowDown className="w-3 h-3" strokeWidth={3} />}
                      {trends.avgViews.direction === 'neutral' && <Minus className="w-3 h-3" strokeWidth={3} />}
                      {trends.avgViews.value}%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatNumber(Math.round(analytics.statistics.avgViews))}
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium">Avg Views Per Video</p>
                  <p className="text-[#64748B] text-xs mt-1">Across {analytics.statistics.totalVideos} videos</p>
                </div>
              </section>
            )}

            {/* Performance Chart Section */}
            {analytics?.bestVideos && analytics.bestVideos.length > 0 && (
              <section className="bg-[#111936] rounded-xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#6366F1]/20 p-2.5 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-[#6366F1]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#E5E7EB]">Performance Overview</h2>
                      <p className="text-[#64748B] text-sm mt-0.5">Views and engagement trends</p>
                    </div>
                  </div>
                  
                  {/* Chart Filters */}
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-[#E5E7EB] text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
                    >
                      <option value="views">Most Views</option>
                      <option value="likes">Most Likes</option>
                      <option value="engagement">Best Engagement</option>
                    </select>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                      className="px-4 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-[#E5E7EB] text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
                    >
                      <option value="5">Top 5</option>
                      <option value="10">Top 10</option>
                      <option value="20">Top 20</option>
                      <option value="50">Top 50</option>
                    </select>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={450}>
                  <AreaChart
                    data={analytics.bestVideos.map((video, index) => ({
                      name: `Video ${index + 1}`,
                      title: video.title.substring(0, 20) + '...',
                      views: video.views,
                      likes: video.likesCount,
                    }))}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748B" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#64748B' }}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#64748B' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#E5E7EB',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '14px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#6366F1" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                      name="Views" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="likes" 
                      stroke="#EC4899" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorLikes)" 
                      name="Likes" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Top Performing Videos Section */}
            {analytics?.bestVideos && analytics.bestVideos.length > 0 && (
              <section className="bg-[#111936] rounded-xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#FACC15]/20 p-2.5 rounded-lg">
                    <Trophy className="w-5 h-5 text-[#FACC15]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#E5E7EB]">Top Performing Videos</h2>
                    <p className="text-[#64748B] text-sm mt-0.5">Ranked by {sortBy === 'views' ? 'views' : sortBy === 'likes' ? 'likes' : 'engagement'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {analytics.bestVideos.map((video, index) => (
                    <div
                      key={video._id}
                      className={`flex items-center gap-5 p-5 rounded-xl transition-all border ${
                        index === 0
                          ? 'bg-linear-to-r from-[#FACC15]/10 to-transparent border-[#FACC15]/30 shadow-lg'
                          : 'bg-[#0F172A] border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          index === 0
                            ? 'bg-linear-to-br from-[#FACC15] to-[#F59E0B] text-[#0A0F1E] shadow-lg'
                            : index === 1
                            ? 'bg-linear-to-br from-[#94A3B8] to-[#64748B] text-white'
                            : index === 2
                            ? 'bg-linear-to-br from-[#FB923C] to-[#F97316] text-white'
                            : 'bg-[#1E293B] text-[#64748B] border border-white/10'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      {/* Thumbnail */}
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-48 h-28 object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 bg-[#FACC15] text-[#0A0F1E] text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            TOP
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold mb-1.5 truncate ${
                          index === 0 ? 'text-lg text-white' : 'text-base text-[#E5E7EB]'
                        }`}>
                          {video.title}
                        </h3>
                        {video.owner && (
                          <p className="text-sm text-[#64748B]">
                            Created by <span className="text-[#9CA3AF] font-medium">@{video.owner.username}</span>
                          </p>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="flex gap-8">
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Eye className="w-4 h-4 text-[#6366F1]" strokeWidth={2.5} />
                            <span className={`font-bold ${
                              index === 0 ? 'text-xl text-[#6366F1]' : 'text-lg text-[#E5E7EB]'
                            }`}>
                              {formatNumber(video.views)}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] font-medium">Views</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1.5">
                            <ThumbsUp className="w-4 h-4 text-[#EC4899]" strokeWidth={2.5} />
                            <span className={`font-bold ${
                              index === 0 ? 'text-xl text-[#EC4899]' : 'text-lg text-[#E5E7EB]'
                            }`}>
                              {formatNumber(video.likesCount)}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] font-medium">Likes</p>
                        </div>
                        
                        {video.engagementScore && (
                          <div className="text-center">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Activity className="w-4 h-4 text-[#7C7CFF]" strokeWidth={2.5} />
                              <span className={`font-bold ${
                                index === 0 ? 'text-xl text-[#7C7CFF]' : 'text-lg text-[#E5E7EB]'
                              }`}>
                                {formatNumber(video.engagementScore)}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] font-medium">Score</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
      </div>
    </div>
  );
};

export default Analytics;
