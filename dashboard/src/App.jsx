import React, { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import Overview from './views/Overview';
import SupplierPerformance from './views/SupplierPerformance';
import RunDetail from './views/RunDetail';
import Workflow from './views/Workflow';
import {
  fetchPipelineRuns,
  fetchKPIs,
  fetchDailyVolume,
  fetchSupplierStats,
  fetchFlagBreakdown,
  fetchFlaggedRecords,
  fetchRunDetail,
} from './lib/db';

export default function App() {
  // Routing state — React state only, no routing library
  const [currentView, setCurrentView] = useState('overview');
  const [selectedRunId, setSelectedRunId] = useState(null);

  // View transition state
  const [viewOpacity, setViewOpacity] = useState('view-active');

  // Data state
  const [runs, setRuns] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [dailyVolume, setDailyVolume] = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [flagBreakdown, setFlagBreakdown] = useState([]);
  const [runDetailData, setRunDetailData] = useState(null);
  const [flaggedRecords, setFlaggedRecords] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Navigation function with smooth transition
  const navigate = useCallback((view, runId = null) => {
    setViewOpacity('view-enter');
    setTimeout(() => {
      setCurrentView(view);
      if (runId) setSelectedRunId(runId);
      setViewOpacity('view-active');
    }, 250);
  }, []);

  // Fetch all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [runsData, kpiData, volumeData] = await Promise.all([
        fetchPipelineRuns(),
        fetchKPIs(),
        fetchDailyVolume(),
      ]);
      setRuns(runsData);
      setKpis(kpiData);
      setDailyVolume(volumeData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load pipeline data. Please check your database connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSupplierData = useCallback(async (dateFrom = null, dateTo = null) => {
    try {
      const [stats, breakdown] = await Promise.all([
        fetchSupplierStats(dateFrom, dateTo),
        fetchFlagBreakdown(dateFrom, dateTo),
      ]);
      setSupplierStats(stats);
      setFlagBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    }
  }, []);

  const loadRunDetail = useCallback(async (runId) => {
    if (!runId) {
      setRunDetailData(null);
      setFlaggedRecords([]);
      return;
    }
    try {
      const [detail, flagged] = await Promise.all([
        fetchRunDetail(runId),
        fetchFlaggedRecords(runId),
      ]);
      setRunDetailData(detail);
      setFlaggedRecords(flagged);
    } catch (err) {
      console.error('Failed to load run detail:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadSupplierData();
  }, [loadData, loadSupplierData]);

  useEffect(() => {
    if (selectedRunId) loadRunDetail(selectedRunId);
  }, [selectedRunId, loadRunDetail]);

  const handleRefresh = () => {
    loadData();
    loadSupplierData();
    if (selectedRunId) loadRunDetail(selectedRunId);
  };

  const handleDateFilter = (dateFrom, dateTo) => loadSupplierData(dateFrom, dateTo);
  const handleSelectRun = (runId) => setSelectedRunId(runId || null);

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview kpis={kpis} dailyVolume={dailyVolume} runs={runs} navigate={navigate} />;
      case 'supplier-performance':
        return <SupplierPerformance supplierStats={supplierStats} flagBreakdown={flagBreakdown} onDateFilter={handleDateFilter} />;
      case 'workflow':
        return <Workflow />;
      case 'run-detail':
        return <RunDetail runs={runs} selectedRunId={selectedRunId} runDetail={runDetailData} flaggedRecords={flaggedRecords} onSelectRun={handleSelectRun} />;
      default:
        return <Overview kpis={kpis} dailyVolume={dailyVolume} runs={runs} navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <NavBar
        currentView={currentView}
        navigate={navigate}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {error && (
          <div className="animate-fade-in-up mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-sm text-[#DC2626] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className={viewOpacity}>
          {renderView()}
        </div>
      </main>
    </div>
  );
}
