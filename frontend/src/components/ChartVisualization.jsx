import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart2, LineChart as LineIcon, PieChart as PieIcon, Download, X } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const ChartVisualization = ({ data, columns, isOpen, onClose }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);

  // Analyze data to suggest axes
  const columnTypes = useMemo(() => {
    if (!data || data.length === 0 || !columns) return {};

    const types = {};
    columns.forEach((col, idx) => {
      const sampleValues = data.slice(0, 10).map(row => row[idx]);
      const isNumeric = sampleValues.every(val =>
        val === null || val === undefined || !isNaN(parseFloat(val))
      );
      types[col] = isNumeric ? 'numeric' : 'string';
    });
    return types;
  }, [data, columns]);

  // Auto-select axes if not set
  useMemo(() => {
    if (!xAxis && columns && columns.length > 0) {
      // Select first string column as x-axis
      const stringCol = columns.find(col => columnTypes[col] === 'string');
      setXAxis(stringCol || columns[0]);

      // Select first numeric column as y-axis
      const numericCol = columns.find(col => columnTypes[col] === 'numeric');
      if (numericCol) {
        setYAxis([numericCol]);
      }
    }
  }, [columns, columnTypes, xAxis]);

  // Transform data for charts
  const chartData = useMemo(() => {
    if (!data || !xAxis || yAxis.length === 0) return [];

    const xIdx = columns.indexOf(xAxis);
    const yIndices = yAxis.map(y => columns.indexOf(y));

    return data.map(row => {
      const point = { name: String(row[xIdx]) };
      yIndices.forEach((yIdx, i) => {
        point[yAxis[i]] = parseFloat(row[yIdx]) || 0;
      });
      return point;
    }).slice(0, 50); // Limit to 50 points for performance
  }, [data, columns, xAxis, yAxis]);

  const downloadChart = () => {
    // This would need a library like html2canvas to actually download
    alert('Download feature would be implemented with html2canvas');
  };

  if (!isOpen) return null;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              {yAxis.map((y, idx) => (
                <Bar key={y} dataKey={y} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              {yAxis.map((y, idx) => (
                <Line key={y} type="monotone" dataKey={y} stroke={COLORS[idx % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              {yAxis.map((y, idx) => (
                <Area
                  key={y}
                  type="monotone"
                  dataKey={y}
                  fill={COLORS[idx % COLORS.length]}
                  stroke={COLORS[idx % COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        // For pie chart, use first Y axis only
        const pieData = chartData.map(item => ({
          name: item.name,
          value: item[yAxis[0]] || 0
        }));

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const toggleYAxis = (column) => {
    setYAxis(prev =>
      prev.includes(column)
        ? prev.filter(y => y !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Query Results Visualization
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadChart}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Download chart"
            >
              <Download className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          {/* Chart Type */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Chart Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'area'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'pie'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Pie
              </button>
            </div>
          </div>

          {/* Axis Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">X-Axis</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
              >
                {columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Y-Axis (multi-select)</label>
              <div className="flex flex-wrap gap-2">
                {columns?.filter(col => columnTypes[col] === 'numeric').map(col => (
                  <button
                    key={col}
                    onClick={() => toggleYAxis(col)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      yAxis.includes(col)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 p-4" style={{ minHeight: '400px' }}>
          {chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select X and Y axes to generate chart</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartVisualization;
