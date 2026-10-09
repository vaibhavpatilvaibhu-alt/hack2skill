import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  PhoneCall,
  ArrowRight,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Radio,
  LogOut,
  User,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import DisasterIndicatorBanner from '../components/DisasterIndicatorBanner';
import ThemeSelector from '../components/ThemeSelector';

export default function StudentDashboard() {
  const {
    reports,
    setActiveTab,
    currentUser,
    logout,
    activeAlerts,
    refreshReports,
    authToken
  } = useReports();

  const [selectedReport, setSelectedReport] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync reports from SQLite DB on mount
  useEffect(() => {
    if (authToken) {
      refreshReports();
    }
  }, [authToken, refreshReports]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshReports();
    } finally {
      setIsRefreshing(false);
    }
  };

  const safeReports = Array.isArray(reports) ? reports : [];

  // Computed metrics from real SQLite reports
  const totalReports = safeReports.length;
  const pendingReports = safeReports.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').length;
  const criticalReports = safeReports.filter(r => (r.priority || '') === 'Critical').length;
  const resolvedReports = safeReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;

  const recentReports = safeReports.slice(0, 5);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Active Disaster Indicator Banner */}
      <DisasterIndicatorBanner />

      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Student Incident Portal • Authenticated Session
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome, {currentUser ? currentUser.name : 'Student Member'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Logged in as <code className="text-blue-600 dark:text-blue-400 font-mono">{currentUser?.email || 'student@campusguardian.demo'}</code>. Submit hazard reports, track repair work orders, and review campus safety notices.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ThemeSelector />

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Campus Issue</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
            title="Sign out of student account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submitted */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">My Reports</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalReports}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Stored in SQLite</p>
        </div>

        {/* Active / In Progress */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{pendingReports}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Under campus review</p>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{resolvedReports}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Repairs completed</p>
        </div>

        {/* Disaster Alerts */}
        <div
          onClick={() => setActiveTab('disaster-indicator')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-red-300 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Disaster Alerts</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">{activeAlerts.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active broadcast notices</p>
        </div>
      </div>

      {/* Main Grid: My Recent Reports & Quick Campus Safety Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Reports (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recent Incident Reports ({safeReports.length})</span>
            </h2>

            <button
              onClick={() => setActiveTab('my-reports')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setActiveTab('my-reports')}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 transition shadow-sm cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {report.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getPriorityBadge(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {report.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {report.summary || report.title || report.description}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{report.location}</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt || report.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>

                    {(report.adminNotes || report.admin_notes) && (
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded border border-blue-100 dark:border-blue-900">
                        <strong>Admin Note:</strong> {report.adminNotes || report.admin_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition flex-shrink-0 self-end sm:self-center">
                    <span>Track Status</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No Reports Filed Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notice physical hazards or broken lights? Submit a report for facilities triage.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                File First Report
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Campus Safety Quick Hub */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Safety Actions & Dispatch</span>
          </h2>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <button
              onClick={() => setActiveTab('report')}
              className="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300">File an Incident Report</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">AI category detection & smart triage</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-red-900 dark:text-red-300">Emergency SOS Dispatch</p>
                <p className="text-[11px] text-red-700 dark:text-red-400">Direct campus police & medical line</p>
              </div>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </button>

            <button
              onClick={() => setActiveTab('disaster-indicator')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Disaster Indicator Broadcasts</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Campus emergency alerts & all-clears</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Emergency Numbers:</p>
              <p>• Campus Police: <strong>(555) 019-911</strong></p>
              <p>• Facilities Rapid Response: <strong>(555) 019-322</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
