import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  TrendingUp,
  Trophy,
  Eye,
  ThumbsUp,
  Activity,
  Play,
  BarChart3,
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
} from 'recharts';

const Analytics = () => {
  const { getVideoAnalytics, loading } = useAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [sortBy, setSortBy] = useState('views');
  const [limit, setLimit] = useState(10);
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

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Video Analytics
              </h1>
              <p className="text-gray-600 text-sm mt-1">Best performing videos and insights</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="views">Most Views</option>
                <option value="likes">Most Likes</option>
                <option value="engagement">Best Engagement</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

        {loading && !analytics ? (
          <LoadingSpinner size="lg" text="Loading analytics..." />
        ) : analytics ? (
          <>
            {/* Statistics Cards */}
            {analytics.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">
                      {analytics.statistics.totalVideos}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Total Videos</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">
                      {formatNumber(analytics.statistics.totalViews)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Total Views</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl">
                      <ThumbsUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">
                      {formatNumber(analytics.statistics.totalLikes)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Total Likes</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">
                      {Math.round(analytics.statistics.avgViews)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Avg Views</p>
                </div>
              </div>
            )}

            {/* Chart */}
            {analytics.bestVideos && analytics.bestVideos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Performance Chart</h2>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={analytics.bestVideos.map((video, index) => ({
                      name: `Video ${index + 1}`,
                      title: video.title.substring(0, 20) + '...',
                      views: video.views,
                      likes: video.likesCount,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#10b981" radius={[8, 8, 0, 0]} name="Views" />
                    <Bar dataKey="likes" fill="#ec4899" radius={[8, 8, 0, 0]} name="Likes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Best Videos List */}
            {analytics.bestVideos && analytics.bestVideos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Top {analytics.bestVideos.length} Performing Videos
                  </h2>
                </div>

                <div className="space-y-4">
                  {analytics.bestVideos.map((video, index) => (
                    <div
                      key={video._id}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      {/* Rank */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                            : index === 2
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-400 to-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Thumbnail */}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded-xl"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{video.title}</h3>
                        {video.owner && (
                          <p className="text-sm text-gray-500">@{video.owner.username}</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-green-600 font-bold mb-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(video.views)}
                          </div>
                          <p className="text-gray-500 text-xs">Views</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-pink-600 font-bold mb-1">
                            <ThumbsUp className="w-4 h-4" />
                            {formatNumber(video.likesCount)}
                          </div>
                          <p className="text-gray-500 text-xs">Likes</p>
                        </div>
                        {video.engagementScore && (
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-purple-600 font-bold mb-1">
                              <Activity className="w-4 h-4" />
                              {formatNumber(video.engagementScore)}
                            </div>
                            <p className="text-gray-500 text-xs">Score</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
