import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  Eye,
  PlusCircle,
  Building,
  Radio,
  ArrowRight,
  RefreshCw,
  X,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import DisasterIndicatorBanner from '../components/DisasterIndicatorBanner';

export default function MyReportsPage() {
  const {
    reports,
    setActiveTab,
    currentUser,
    openAuthModal,
    refreshReports,
    authToken
  } = useReports();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync reports from SQLite DB on mount
  useEffect(() => {
    if (authToken && currentUser) {
      refreshReports();
    }
  }, [authToken, currentUser, refreshReports]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshReports();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Authentication Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please log in with student credentials to track your submitted campus incident reports and view maintenance updates.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('student')}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Sign In as Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  const safeReports = Array.isArray(reports) ? reports : [];

  const filteredReports = safeReports.filter(r => {
    const idStr = (r.id || '').toLowerCase();
    const locStr = (r.location || '').toLowerCase();
    const descStr = (r.description || '').toLowerCase();
    const sumStr = (r.summary || r.title || '').toLowerCase();
    const searchLower = (search || '').trim().toLowerCase();

    const matchSearch =
      searchLower === '' ||
      idStr.includes(searchLower) ||
      locStr.includes(searchLower) ||
      descStr.includes(searchLower) ||
      sumStr.includes(searchLower);

    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

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

  // Pipeline Steps
  const pipelineSteps = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

  const getStepIndex = (status) => {
    if (status === 'Closed') return 4;
    const idx = pipelineSteps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6 pb-16">
      <DisasterIndicatorBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Student Incident Tracker • Synchronized with SQLite DB
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            My Submitted Campus Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track real-time progress, assigned campus departments, and official administrative notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, location, or issue description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 transition shadow-sm cursor-pointer space-y-3 group"
            >
              {/* Row 1: ID, Badges, Date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: {report.category}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(report.createdAt || report.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {/* Row 2: Title / Summary */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {report.summary || report.title || report.description}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{report.location}</span>
                  {report.department && (
                    <>
                      <span>•</span>
                      <span>{report.department}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Row 3: Admin Notes preview (if any) */}
              {(report.adminNotes || report.admin_notes) && (
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
                  <p className="font-semibold text-[11px]">Administrator Update:</p>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {report.adminNotes || report.admin_notes}
                  </p>
                </div>
              )}

              {/* Progress Pipeline Dots */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {pipelineSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(report.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <span className={`hidden sm:inline text-[10px] ${isPassed ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                          {step}
                        </span>
                        {idx < pipelineSteps.length - 1 && (
                          <span className="w-3 h-px bg-slate-200 dark:bg-slate-700 hidden sm:inline" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No Reports Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'All'
                ? 'No incident reports match your current filter criteria.'
                : "You haven't submitted any incident reports yet. Click below to file a new report."}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Report an Issue
          </button>
        </div>
      )}

      {/* Report Details Drawer / Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {selectedReport.id}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getPriorityBadge(selectedReport.priority)}`}>
                  {selectedReport.priority}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedReport.summary || selectedReport.title}
              </h2>
            </div>

            {/* Location & Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span><strong>Location:</strong> {selectedReport.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span><strong>Department:</strong> {selectedReport.department || 'General Operations'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span><strong>Submitted:</strong> {new Date(selectedReport.createdAt || selectedReport.created_at || Date.now()).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span><strong>Assigned Staff:</strong> {selectedReport.assignedStaff || selectedReport.assigned_staff || 'Pending Triage'}</span>
              </div>
            </div>

            {/* Student Observation */}
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                Observation Details:
              </p>
              <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
                "{selectedReport.description}"
              </p>
            </div>

            {/* Official Administrator Notes */}
            {(selectedReport.adminNotes || selectedReport.admin_notes) && (
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-blue-600 dark:text-blue-400 uppercase text-[10px] tracking-wide">
                  Official Administrative Notes:
                </p>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedReport.adminNotes || selectedReport.admin_notes}
                </div>
              </div>
            )}

            {/* Resolution Details */}
            {(selectedReport.resolutionDetails || selectedReport.resolution_details) && (
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wide">
                  Repair & Resolution Summary:
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedReport.resolutionDetails || selectedReport.resolution_details}
                </div>
              </div>
            )}

            {/* Timeline */}
            {selectedReport.timeline && selectedReport.timeline.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                  Audit Timeline:
                </p>
                <div className="space-y-2 pl-2 border-l-2 border-blue-200 dark:border-blue-900">
                  {selectedReport.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-3 text-xs">
                      <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{event.status}</span>
                        <span className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                      {event.note && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{event.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
