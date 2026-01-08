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
  MessageSquare,
  Users,
  Clock,
  Target,
  Zap,
  Video,
  Calendar,
  Download,
  Filter,
  RefreshCw,
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const Analytics = () => {
  const { getVideoAnalytics, loading } = useAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [sortBy, setSortBy] = useState('views');
  const [limit, setLimit] = useState(10);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('area'); // 'area', 'bar', 'line'
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
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

  // Calculate engagement rate
  const calculateEngagementRate = () => {
    if (!analytics?.statistics) return 0;
    const { totalViews, totalLikes } = analytics.statistics;
    if (totalViews === 0) return 0;
    return ((totalLikes / totalViews) * 100).toFixed(2);
  };

  // Mock trend data (in real app, this comes from API)
  const trends = {
    views: calculateTrend(analytics?.statistics?.totalViews || 0, (analytics?.statistics?.totalViews || 0) * 0.75),
    likes: calculateTrend(analytics?.statistics?.totalLikes || 0, (analytics?.statistics?.totalLikes || 0) * 0.85),
    avgViews: calculateTrend(analytics?.statistics?.avgViews || 0, (analytics?.statistics?.avgViews || 0) * 0.8),
    engagement: calculateTrend(parseFloat(calculateEngagementRate()), parseFloat(calculateEngagementRate()) * 0.9),
  };

  // Prepare data for pie chart
  const getPieChartData = () => {
    if (!analytics?.bestVideos) return [];
    return analytics.bestVideos.slice(0, 5).map((video, index) => ({
      name: `Video ${index + 1}`,
      value: video.views,
      color: ['#6366F1', '#EC4899', '#7C7CFF', '#F59E0B', '#22C55E'][index],
    }));
  };

  // Prepare data for radar chart
  const getRadarChartData = () => {
    if (!analytics?.statistics) return [];
    const maxViews = analytics.statistics.totalViews;
    const maxLikes = analytics.statistics.totalLikes;
    
    return [
      { metric: 'Views', value: 100, fullMark: 100 },
      { metric: 'Likes', value: (maxLikes / maxViews * 100) || 0, fullMark: 100 },
      { metric: 'Engagement', value: parseFloat(calculateEngagementRate()), fullMark: 100 },
      { metric: 'Videos', value: (analytics.statistics.totalVideos / 100) * 100, fullMark: 100 },
      { metric: 'Avg Views', value: (analytics.statistics.avgViews / (maxViews / analytics.statistics.totalVideos)) * 100, fullMark: 100 },
    ];
  };

  const COLORS = ['#6366F1', '#EC4899', '#7C7CFF', '#F59E0B', '#22C55E'];

  return (
    <div className="flex-1 overflow-auto bg-[#0A0F1E] ml-80 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Analytics Hero Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-linear-to-br from-[#7C7CFF] to-[#2EE6D6] rounded-2xl shadow-xl shadow-[#7C7CFF]/30">
              <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Video Analytics</h1>
              <p className="text-gray-400 text-base">Performance insights and detailed metrics</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-2.5 bg-[#111936] border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50 flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {/* Time Range Selector */}
            <div className="flex gap-1 bg-[#111936] rounded-xl p-1 border border-white/10">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {loading && !analytics ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading analytics..." />
          </div>
        ) : !analytics ? (
          <div className="text-center py-20 bg-[#111936] rounded-xl border border-white/10">
            <div className="bg-[#6366F1]/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#6366F1]" strokeWidth={2} />
            </div>
            <p className="text-gray-400 text-lg font-medium">No analytics data available</p>
            <p className="text-gray-500 text-sm mt-2">Analytics will appear once videos are published</p>
          </div>
        ) : (
          <>
            {/* Key Insight Hero Card */}
            {analytics?.statistics && (
              <div className="bg-linear-to-br from-[#111936] via-[#1a1f3a] to-[#111936] rounded-2xl p-6 border border-[#7C7CFF]/30 shadow-xl shadow-[#7C7CFF]/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#7C7CFF]/20 p-3 rounded-xl">
                        <Sparkles className="w-6 h-6 text-[#7C7CFF]" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Performance Summary</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-3">
                      {formatNumber(analytics.statistics.totalViews)} Total Views
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
                          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                          <span className="font-semibold">{trends.views.value}%</span>
                        </div>
                        <span className="text-gray-400">vs last period</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400">
                        Across <span className="text-white font-semibold">{analytics.statistics.totalVideos}</span> videos
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400">
                        <span className="text-white font-semibold">{calculateEngagementRate()}%</span> engagement rate
                      </span>
                    </div>
                  </div>
                  
                  {/* Mini Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5 text-center">
                      <Video className="w-5 h-5 text-[#6366F1] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{analytics.statistics.totalVideos}</p>
                      <p className="text-xs text-gray-400 mt-1">Videos</p>
                    </div>
                    <div className="bg-[#0F172A] rounded-xl p-4 border border-white/5 text-center">
                      <Target className="w-5 h-5 text-[#EC4899] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.statistics.avgViews)}</p>
                      <p className="text-xs text-gray-400 mt-1">Avg Views</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards with Enhanced Trends */}
            {analytics?.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Views Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10 hover:border-[#6366F1]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#6366F1]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6 text-[#6366F1]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      trends.views.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.views.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.views.direction === 'up' && <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.views.direction === 'down' && <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.views.direction === 'neutral' && <Minus className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.views.value}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatNumber(analytics.statistics.totalViews)}
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Views</p>
                  <p className="text-gray-600 text-xs">Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days</p>
                </div>

                {/* Total Likes Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10 hover:border-[#EC4899]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#EC4899]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <ThumbsUp className="w-6 h-6 text-[#EC4899]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      trends.likes.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.likes.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.likes.direction === 'up' && <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.likes.direction === 'down' && <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.likes.direction === 'neutral' && <Minus className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.likes.value}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatNumber(analytics.statistics.totalLikes)}
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Likes</p>
                  <p className="text-gray-600 text-xs">Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days</p>
                </div>

                {/* Avg Views Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10 hover:border-[#7C7CFF]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#7C7CFF]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-[#7C7CFF]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      trends.avgViews.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.avgViews.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.avgViews.direction === 'up' && <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.avgViews.direction === 'down' && <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.avgViews.direction === 'neutral' && <Minus className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.avgViews.value}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatNumber(Math.round(analytics.statistics.avgViews))}
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Avg Views/Video</p>
                  <p className="text-gray-600 text-xs">Across {analytics.statistics.totalVideos} videos</p>
                </div>

                {/* Engagement Rate Card */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10 hover:border-[#22C55E]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#22C55E]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-[#22C55E]" strokeWidth={2.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      trends.engagement.direction === 'up' 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : trends.engagement.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {trends.engagement.direction === 'up' && <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.engagement.direction === 'down' && <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.engagement.direction === 'neutral' && <Minus className="w-3.5 h-3.5" strokeWidth={3} />}
                      {trends.engagement.value}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {calculateEngagementRate()}%
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Engagement Rate</p>
                  <p className="text-gray-600 text-xs">Likes per view ratio</p>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            {analytics?.bestVideos && analytics.bestVideos.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Performance Chart - Takes 2 columns */}
                <div className="lg:col-span-2 bg-[#111936] rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#6366F1]/20 p-2.5 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-[#6366F1]" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Performance Overview</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Views and engagement trends</p>
                      </div>
                    </div>
                    
                    {/* Chart Type Selector */}
                    <div className="flex gap-2 bg-[#0F172A] rounded-lg p-1 border border-white/10">
                      {['area', 'bar', 'line'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                            chartType === type
                              ? 'bg-[#6366F1] text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4 flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
                    >
                      <option value="views">Most Views</option>
                      <option value="likes">Most Likes</option>
                      <option value="engagement">Best Engagement</option>
                    </select>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                      className="px-4 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#6366F1] outline-none"
                    >
                      <option value="5">Top 5</option>
                      <option value="10">Top 10</option>
                      <option value="20">Top 20</option>
                    </select>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    {chartType === 'area' ? (
                      <AreaChart
                        data={analytics.bestVideos.map((video, index) => ({
                          name: `#${index + 1}`,
                          title: video.title.substring(0, 15) + '...',
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
                        <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#E5E7EB',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                        <Area type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" name="Views" />
                        <Area type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLikes)" name="Likes" />
                      </AreaChart>
                    ) : chartType === 'bar' ? (
                      <BarChart
                        data={analytics.bestVideos.map((video, index) => ({
                          name: `#${index + 1}`,
                          views: video.views,
                          likes: video.likesCount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#E5E7EB',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                        <Bar dataKey="views" fill="#6366F1" radius={[8, 8, 0, 0]} name="Views" />
                        <Bar dataKey="likes" fill="#EC4899" radius={[8, 8, 0, 0]} name="Likes" />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={analytics.bestVideos.map((video, index) => ({
                          name: `#${index + 1}`,
                          views: video.views,
                          likes: video.likesCount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tick={{ fill: '#64748B' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#E5E7EB',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                        <Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 4 }} name="Views" />
                        <Line type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 4 }} name="Likes" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Distribution Pie Chart */}
                <div className="bg-[#111936] rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#7C7CFF]/20 p-2.5 rounded-xl">
                      <Target className="w-5 h-5 text-[#7C7CFF]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">View Distribution</h3>
                      <p className="text-gray-500 text-xs mt-0.5">Top 5 videos</p>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => formatNumber(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    {getPieChartData().map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-400">{item.name}</span>
                        </div>
                        <span className="text-white font-semibold">{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Performing Videos Section */}
            {analytics?.bestVideos && analytics.bestVideos.length > 0 && (
              <div className="bg-[#111936] rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FACC15]/20 p-2.5 rounded-xl">
                      <Trophy className="w-5 h-5 text-[#FACC15]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Top Performing Videos</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Ranked by {sortBy === 'views' ? 'views' : sortBy === 'likes' ? 'likes' : 'engagement'}</p>
                    </div>
                  </div>
                  
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="space-y-3">
                  {analytics.bestVideos.map((video, index) => (
                    <div
                      key={video._id}
                      className={`group flex items-center gap-5 p-5 rounded-xl transition-all border ${
                        index === 0
                          ? 'bg-linear-to-r from-[#FACC15]/10 via-transparent to-transparent border-[#FACC15]/30 shadow-lg'
                          : 'bg-[#0F172A] border-white/5 hover:border-white/10 hover:bg-[#0F172A]/80'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${
                            index === 0
                              ? 'bg-linear-to-br from-[#FACC15] to-[#F59E0B] text-[#0A0F1E]'
                              : index === 1
                              ? 'bg-linear-to-br from-[#94A3B8] to-[#64748B] text-white'
                              : index === 2
                              ? 'bg-linear-to-br from-[#FB923C] to-[#F97316] text-white'
                              : 'bg-[#1E293B] text-gray-400 border border-white/10'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1">
                            <Trophy className={`w-5 h-5 ${
                              index === 0 ? 'text-[#FACC15]' : index === 1 ? 'text-[#94A3B8]' : 'text-[#FB923C]'
                            }`} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="relative shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-56 h-32 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                        />
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 bg-[#FACC15] text-[#0A0F1E] text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            TOP
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {video.duration ? Math.floor(video.duration / 60) : 0}:{video.duration ? (video.duration % 60).toString().padStart(2, '0') : '00'}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-[#7C7CFF] transition-colors ${
                          index === 0 ? 'text-xl text-white' : 'text-lg text-white'
                        }`}>
                          {video.title}
                        </h3>
                        {video.owner && (
                          <div className="flex items-center gap-2 mb-3">
                            <img 
                              src={video.owner.avatar} 
                              alt={video.owner.username}
                              className="w-6 h-6 rounded-full border border-white/20"
                            />
                            <p className="text-sm text-gray-400">
                              by <span className="text-gray-300 font-medium">@{video.owner.username}</span>
                            </p>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Engagement Score</span>
                            <span className="font-semibold text-white">{((video.likesCount / video.views) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-linear-to-r from-[#6366F1] to-[#EC4899] rounded-full transition-all"
                              style={{ width: `${Math.min(((video.likesCount / video.views) * 100), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="flex gap-6 shrink-0">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="p-2 bg-[#6366F1]/10 rounded-lg">
                              <Eye className="w-5 h-5 text-[#6366F1]" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className={`block font-bold ${
                            index === 0 ? 'text-2xl text-[#6366F1]' : 'text-xl text-white'
                          }`}>
                            {formatNumber(video.views)}
                          </span>
                          <p className="text-xs text-gray-500 font-medium mt-1">Views</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="p-2 bg-[#EC4899]/10 rounded-lg">
                              <ThumbsUp className="w-5 h-5 text-[#EC4899]" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className={`block font-bold ${
                            index === 0 ? 'text-2xl text-[#EC4899]' : 'text-xl text-white'
                          }`}>
                            {formatNumber(video.likesCount)}
                          </span>
                          <p className="text-xs text-gray-500 font-medium mt-1">Likes</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="p-2 bg-[#7C7CFF]/10 rounded-lg">
                              <Activity className="w-5 h-5 text-[#7C7CFF]" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className={`block font-bold ${
                            index === 0 ? 'text-2xl text-[#7C7CFF]' : 'text-xl text-white'
                          }`}>
                            {formatNumber(video.commentsCount || 0)}
                          </span>
                          <p className="text-xs text-gray-500 font-medium mt-1">Comments</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
