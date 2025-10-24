import React from 'react';
import { Clock, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';

const PerformanceProfiler = ({ result, isOpen, onClose }) => {
  if (!isOpen || !result) return null;

  const executionTime = result.execution_time || 0;
  const rowsAffected = result.rows_affected || result.data?.length || 0;

  // Performance rating
  const getPerformanceRating = (time) => {
    if (time < 0.1) return { rating: 'Excellent', color: 'green', icon: CheckCircle };
    if (time < 0.5) return { rating: 'Good', color: 'blue', icon: CheckCircle };
    if (time < 2) return { rating: 'Fair', color: 'yellow', icon: AlertTriangle };
    return { rating: 'Slow', color: 'red', icon: AlertTriangle };
  };

  const performance = getPerformanceRating(executionTime);
  const PerformanceIcon = performance.icon;

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];

    if (executionTime > 2) {
      recommendations.push({
        type: 'warning',
        title: 'Slow Query Detected',
        description: 'Query took more than 2 seconds. Consider adding indexes or optimizing joins.',
      });
    }

    if (rowsAffected > 10000) {
      recommendations.push({
        type: 'info',
        title: 'Large Result Set',
        description: 'Consider adding WHERE clause or LIMIT to reduce data transfer.',
      });
    }

    if (result.query && result.query.includes('SELECT *')) {
      recommendations.push({
        type: 'tip',
        title: 'Select Specific Columns',
        description: 'Using SELECT * may fetch unnecessary data. Specify only needed columns.',
      });
    }

    if (result.query && result.query.toLowerCase().includes('join') && executionTime > 1) {
      recommendations.push({
        type: 'tip',
        title: 'JOIN Performance',
        description: 'Ensure foreign key columns are indexed for better JOIN performance.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Well Optimized',
        description: 'This query appears to be well optimized. No major concerns detected.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Performance Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Performance Summary */}
          <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Query Performance</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold text-${performance.color}-500 mb-1`}>
                  {executionTime.toFixed(3)}s
                </div>
                <div className="text-sm text-gray-400">Execution Time</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {rowsAffected.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Rows Affected</div>
              </div>

              <div className="text-center">
                <PerformanceIcon className={`w-12 h-12 mx-auto mb-1 text-${performance.color}-500`} />
                <div className={`text-sm font-semibold text-${performance.color}-500`}>
                  {performance.rating}
                </div>
              </div>
            </div>
          </div>

          {/* Query Details */}
          {result.query && (
            <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Query</h3>
              <pre className="bg-gray-800 dark:bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                {result.query}
              </pre>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Recommendations</h3>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  rec.type === 'warning'
                    ? 'bg-red-900/20 border-red-700'
                    : rec.type === 'info'
                    ? 'bg-blue-900/20 border-blue-700'
                    : rec.type === 'success'
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-yellow-900/20 border-yellow-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${
                    rec.type === 'warning'
                      ? 'text-red-400'
                      : rec.type === 'info'
                      ? 'text-blue-400'
                      : rec.type === 'success'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}>
                    {rec.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : rec.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                    <p className="text-gray-300 text-sm">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Breakdown */}
          <div className="bg-gray-750 dark:bg-gray-850 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Detailed Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Query Complexity</span>
                <span className="text-white">
                  {result.query ? (result.query.length > 200 ? 'High' : result.query.length > 50 ? 'Medium' : 'Low') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Result Set Size</span>
                <span className="text-white">
                  {rowsAffected < 100 ? 'Small' : rowsAffected < 1000 ? 'Medium' : 'Large'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Throughput</span>
                <span className="text-white">
                  {executionTime > 0 ? Math.round(rowsAffected / executionTime) : 'N/A'} rows/sec
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Timestamp</span>
                <span className="text-white">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceProfiler;
