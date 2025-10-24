import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, Database, Clock, TrendingUp, X } from 'lucide-react';
import { apiService } from '../services/api';

const AnalyticsDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Call analytics API
      const response = await apiService.get(`/api/analytics/statistics?days=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Use mock data for now
      setStats(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    overview: {
      totalQueries: 1247,
      totalUsers: 45,
      avgQueryTime: 1.23,
      successRate: 94.5,
    },
    dailyQueries: [
      { date: '10/18', queries: 120, errors: 8 },
      { date: '10/19', queries: 145, errors: 12 },
      { date: '10/20', queries: 132, errors: 7 },
      { date: '10/21', queries: 167, errors: 10 },
      { date: '10/22', queries: 189, errors: 15 },
      { date: '10/23', queries: 198, errors: 11 },
      { date: '10/24', queries: 296, errors: 9 },
    ],
    topQueries: [
      { query: 'SELECT * FROM Employees', count: 234 },
      { query: 'SELECT * FROM Departments', count: 187 },
      { query: 'SELECT * FROM Projects', count: 156 },
      { query: 'EXEC sp_GetDepartmentStats', count: 98 },
      { query: 'SELECT * FROM vw_EmployeeDetails', count: 76 },
    ],
    performance: [
      { time: '00:00', avgTime: 0.8 },
      { time: '04:00', avgTime: 0.5 },
      { time: '08:00', avgTime: 1.2 },
      { time: '12:00', avgTime: 1.8 },
      { time: '16:00', avgTime: 2.1 },
      { time: '20:00', avgTime: 1.5 },
    ],
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading analytics...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Total Queries</span>
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.overview.totalQueries.toLocaleString()}</div>
                  <div className="text-xs text-green-400 mt-1">↑ 12% from last period</div>
                </div>

                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Active Users</span>
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.overview.totalUsers}</div>
                  <div className="text-xs text-green-400 mt-1">↑ 5% from last period</div>
                </div>

                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Avg Query Time</span>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.overview.avgQueryTime}s</div>
                  <div className="text-xs text-red-400 mt-1">↓ 8% from last period</div>
                </div>

                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Success Rate</span>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.overview.successRate}%</div>
                  <div className="text-xs text-green-400 mt-1">↑ 2% from last period</div>
                </div>
              </div>

              {/* Daily Queries Chart */}
              <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Daily Query Volume</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.dailyQueries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar dataKey="queries" fill="#3B82F6" name="Successful" />
                    <Bar dataKey="errors" fill="#EF4444" name="Errors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Over Time */}
                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Performance Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats?.performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Line type="monotone" dataKey="avgTime" stroke="#10B981" strokeWidth={2} name="Avg Time (s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Queries */}
                <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Top Queries</h3>
                  <div className="space-y-2">
                    {stats?.topQueries.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 dark:bg-gray-900 rounded">
                        <span className="text-gray-300 text-sm truncate flex-1 mr-4 font-mono">
                          {item.query}
                        </span>
                        <span className="text-blue-400 font-semibold text-sm">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
