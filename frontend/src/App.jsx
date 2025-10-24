import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Split from 'react-split';
import SQLEditor from './components/Editor';
import ResultsGrid from './components/ResultsGrid';
import SchemaTree from './components/SchemaTree';
import QueryHistory from './components/QueryHistory';
import ConfirmDialog from './components/ConfirmDialog';
import SessionHeader from './components/SessionHeader';
import ThemeToggle from './components/ThemeToggle';
import TabBar from './components/TabBar';
import TemplateLibrary from './components/TemplateLibrary';
import ChartVisualization from './components/ChartVisualization';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PerformanceProfiler from './components/PerformanceProfiler';
import VisualQueryBuilder from './components/VisualQueryBuilder';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TabProvider, useTab } from './contexts/TabContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { apiService } from './services/api';
import { exportToCSV, exportToJSON, exportToExcel } from './utils/helpers';
import { Database, BarChart2, Activity, FileText, Zap, Box } from 'lucide-react';

// Main SQL Playground Component (protected)
function SQLPlayground() {
  const { user, isAdmin, isSandbox } = useAuth();
  const {
    activeTab,
    updateActiveTabQuery,
    updateActiveTabResult,
    setActiveTabExecuting,
  } = useTab();

  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [schema, setSchema] = useState(null);

  // Modal states
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);

  useEffect(() => {
    checkConnection();

    // Set default database for sandbox users
    if (isSandbox && user?.database_name) {
      setCurrentDatabase(user.database_name);
    }
  }, [user, isSandbox]);

  useEffect(() => {
    if (currentDatabase) {
      fetchSchema();
    }
  }, [currentDatabase]);

  const checkConnection = async () => {
    try {
      const status = await apiService.testConnection();
      setConnectionStatus(status);

      // For admin users, set database from connection status
      if (isAdmin && status.database && !currentDatabase) {
        setCurrentDatabase(status.database);
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus({ connected: false, error: err.error });
    }
  };

  const fetchSchema = async () => {
    try {
      const response = await apiService.get(`/api/schema/${currentDatabase}`);
      setSchema(response.data);
    } catch (err) {
      console.error('Failed to fetch schema:', err);
    }
  };

  const handleExecuteQuery = async (confirmDestructive = false, queryToExecute = null) => {
    const queryText = queryToExecute !== null ? queryToExecute : activeTab.query;

    if (typeof queryText !== 'string' || !queryText.trim()) {
      updateActiveTabResult({
        success: false,
        error: 'Please enter a query to execute'
      });
      return;
    }

    setActiveTabExecuting(true);

    try {
      const result = await apiService.executeQuery(
        queryText,
        currentDatabase,
        confirmDestructive
      );

      if (result.requires_confirmation && !confirmDestructive) {
        setConfirmData({
          query: result.query,
          operation: result.operation,
          affected: result.affected_objects,
        });
        setShowConfirm(true);
        setActiveTabExecuting(false);
        return;
      }

      updateActiveTabResult(result);
      setHistoryKey(prev => prev + 1);
      setShowConfirm(false);
      setConfirmData(null);
    } catch (err) {
      updateActiveTabResult({
        success: false,
        error: err.error || 'Query execution failed'
      });
    } finally {
      setActiveTabExecuting(false);
    }
  };

  const handleConfirmExecution = () => {
    setShowConfirm(false);
    handleExecuteQuery(true);
  };

  const handleCancelExecution = () => {
    setShowConfirm(false);
    setConfirmData(null);
    setActiveTabExecuting(false);
  };

  const handleExport = async (format) => {
    if (!activeTab.result?.data || activeTab.result.data.length === 0) {
      alert('No data to export');
      return;
    }

    const filename = `query_result_${new Date().toISOString().slice(0, 10)}`;

    try {
      if (format === 'csv') {
        exportToCSV(activeTab.result.data, activeTab.result.columns, filename);
      } else if (format === 'json') {
        exportToJSON(activeTab.result.data, filename);
      } else if (format === 'excel') {
        await exportToExcel(activeTab.result.data, activeTab.result.columns, filename);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    }
  };

  const handleSelectQuery = (historyQuery) => {
    updateActiveTabQuery(historyQuery);
  };

  const handleDatabaseChange = (database) => {
    setCurrentDatabase(database);
  };

  const handleVisualQueryGenerate = (sql) => {
    updateActiveTabQuery(sql);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 dark:bg-gray-950">
      {/* Session Header */}
      <SessionHeader />

      {/* Main Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">SQL Playground</h1>
            <p className="text-sm text-gray-400">
              {isAdmin ? 'Administrator Access' : 'Sandbox Environment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Feature Buttons */}
          <button
            onClick={() => setShowQueryBuilder(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 text-gray-300 transition-all"
            title="Visual Query Builder"
          >
            <Box className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Builder</span>
          </button>

          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 text-gray-300 transition-all"
            title="Query Templates"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Templates</span>
          </button>

          {activeTab.result?.data && activeTab.result.data.length > 0 && (
            <>
              <button
                onClick={() => setShowChart(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 text-gray-300 transition-all"
                title="Visualize Results"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="text-sm hidden md:inline">Visualize</span>
              </button>

              <button
                onClick={() => setShowPerformance(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 text-gray-300 transition-all"
                title="Performance Profile"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm hidden md:inline">Performance</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 text-gray-300 transition-all"
              title="Analytics Dashboard"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Analytics</span>
            </button>
          )}

          <ThemeToggle />

          {connectionStatus.connected ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-300">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-700 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-300">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Split
          className="flex h-full"
          sizes={[20, 80]}
          minSize={[200, 500]}
          gutterSize={8}
          gutterStyle={() => ({
            backgroundColor: '#374151',
            cursor: 'col-resize',
          })}
        >
          {/* Left Sidebar */}
          <div className="bg-gray-800 dark:bg-gray-900 overflow-hidden flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-auto">
              <SchemaTree
                currentDatabase={currentDatabase}
                onDatabaseChange={handleDatabaseChange}
                onTableSelect={(table) => {
                  updateActiveTabQuery(`SELECT * FROM ${table.schema}.${table.name}`);
                }}
              />
            </div>

            <div className="border-t border-gray-700 dark:border-gray-800 h-80 min-h-0 flex flex-col">
              <QueryHistory
                key={historyKey}
                onSelectQuery={handleSelectQuery}
              />
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-col bg-gray-900 dark:bg-gray-950">
            {/* Tab Bar */}
            <TabBar />

            <Split
              direction="vertical"
              sizes={[50, 50]}
              minSize={[200, 200]}
              gutterSize={8}
              gutterStyle={() => ({
                backgroundColor: '#374151',
                cursor: 'row-resize',
              })}
              className="flex flex-col h-full"
            >
              {/* SQL Editor */}
              <div className="overflow-hidden flex flex-col h-full min-h-0">
                <SQLEditor
                  value={activeTab.query}
                  onChange={updateActiveTabQuery}
                  onExecute={handleExecuteQuery}
                  isExecuting={activeTab.isExecuting}
                  currentDatabase={currentDatabase}
                />
              </div>

              {/* Results Grid */}
              <div className="overflow-hidden flex flex-col h-full min-h-0">
                <ResultsGrid
                  result={activeTab.result}
                  onExport={handleExport}
                />
              </div>
            </Split>
          </div>
        </Split>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-800 px-6 py-3">
        <div className="flex items-center justify-center text-sm text-gray-400">
          <span>© 2025 Khalid Abdelaty | </span>
          <a
            href="https://www.linkedin.com/in/khalidabdelaty/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            LinkedIn Profile
          </a>
        </div>
      </footer>

      {/* Modals */}
      {showConfirm && confirmData && (
        <ConfirmDialog
          operation={confirmData.operation}
          affectedObjects={confirmData.affected}
          onConfirm={handleConfirmExecution}
          onCancel={handleCancelExecution}
        />
      )}

      <TemplateLibrary isOpen={showTemplates} onClose={() => setShowTemplates(false)} />

      <ChartVisualization
        data={activeTab.result?.data}
        columns={activeTab.result?.columns}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />

      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

      <PerformanceProfiler
        result={activeTab.result}
        isOpen={showPerformance}
        onClose={() => setShowPerformance(false)}
      />

      <VisualQueryBuilder
        isOpen={showQueryBuilder}
        onClose={() => setShowQueryBuilder(false)}
        onGenerate={handleVisualQueryGenerate}
        schema={schema}
      />
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TabProvider>
            <TemplateProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <SQLPlayground />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TemplateProvider>
          </TabProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
