import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  fetchServerAuditLogs,
  exportReportsFile
} from '../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  Sliders,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Building,
  RefreshCw,
  Eye,
  X,
  Download,
  Radio,
  FileText,
  Activity,
  History,
  MapPin,
  Lock,
  Loader2,
  Calendar,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import DisasterIndicatorBanner from '../components/DisasterIndicatorBanner';
import ThemeSelector from '../components/ThemeSelector';

export default function AdminDashboard() {
  const {
    reports,
    updateReport,
    addToast,
    refreshReports,
    authToken,
    activeAlerts,
    setActiveTab,
    currentUser,
    isAuthLoading,
    openAuthModal
  } = useReports();

  // Active Tab View in Admin Hub ('reports' | 'audit')
  const [adminView, setAdminView] = useState('reports');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync reports from SQLite DB on mount
  useEffect(() => {
    if (authToken && currentUser?.role === 'admin') {
      refreshReports();
    }
  }, [authToken, currentUser, refreshReports]);

  // Load audit logs when switching to 'audit' tab
  useEffect(() => {
    if (adminView === 'audit' && authToken) {
      loadAuditLogs();
    }
  }, [adminView, authToken]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshReports();
      addToast('Data Synchronized', 'Retrieved latest incident records from SQLite database.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsAuditLoading(true);
    try {
      const logs = await fetchServerAuditLogs(authToken);
      setAuditLogs(logs || []);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (report) => {
    setSelectedReport(report);
    setEditStatus(report.status || 'Submitted');
    setEditPriority(report.priority || 'Medium');
    setEditDepartment(report.department || 'General Campus Operations');
    setEditStaff(report.assignedStaff || report.assigned_staff || '');
    setAdminNotes(report.adminNotes || report.admin_notes || '');
    setResolutionDetails(report.resolutionDetails || report.resolution_details || '');
  };

  // Save Report Edits
  const handleSaveReport = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      await updateReport(selectedReport.id, {
        status: editStatus,
        priority: editPriority,
        department: editDepartment,
        assignedStaff: editStaff,
        adminNotes: adminNotes,
        resolutionDetails: resolutionDetails,
        note: `Status updated to ${editStatus} by ${currentUser?.name || 'Administrator'}`
      });
      addToast('Report Updated', `Report ${selectedReport.id} successfully updated in database.`, 'success');
      setSelectedReport(null);
      await refreshReports();
    } catch (err) {
      addToast('Update Failed', err.message || 'Could not update report.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Export
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportReportsFile(format, authToken);
      addToast('Export Generated', `Downloaded reports registry in ${format.toUpperCase()} format.`, 'success');
    } catch (err) {
      addToast('Export Error', err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Loading State Guard
  if (isAuthLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verifying Administrator Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Validating session token and synchronizing incident database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthorized Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              The Campus Operations Console is restricted to authorized campus safety officers and administrators. Please authenticate with administrator privileges.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('admin')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Sign In as Administrator
            </button>
            <button
              onClick={() => setActiveTab('welcome')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe report list
  const safeReports = Array.isArray(reports) ? reports : [];

  // Computed metrics from real SQLite reports
  const totalReports = safeReports.length;
  const newReports = safeReports.filter(r => (r.status || '') === 'Submitted').length;
  const inProgressReports = safeReports.filter(r => ['Under Review', 'Assigned', 'In Progress'].includes(r.status)).length;
  const resolvedReports = safeReports.filter(r => ['Resolved', 'Closed'].includes(r.status)).length;
  const criticalReports = safeReports.filter(r => (r.priority || '') === 'Critical').length;
  const activeAlertsCount = Array.isArray(activeAlerts) ? activeAlerts.length : 0;

  // Chart 1: Category Distribution
  const categoryCounts = safeReports.reduce((acc, r) => {
    const cat = r.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));

  // Chart 2: Priority Distribution
  const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
  const priorityColors = {
    Critical: '#DC2626',
    High: '#D97706',
    Medium: '#2563EB',
    Low: '#64748B'
  };

  const priorityChartData = priorityOrder.map(p => ({
    name: p,
    value: safeReports.filter(r => (r.priority || '') === p).length
  })).filter(item => item.value > 0);

  // Filtered reports for table with strict null safety
  const filteredReports = safeReports.filter(r => {
    const idStr = (r.id || '').toLowerCase();
    const locStr = (r.location || '').toLowerCase();
    const descStr = (r.description || '').toLowerCase();
    const sumStr = (r.summary || r.title || '').toLowerCase();
    const deptStr = (r.department || '').toLowerCase();
    const searchLower = (search || '').trim().toLowerCase();

    const matchSearch =
      searchLower === '' ||
      idStr.includes(searchLower) ||
      locStr.includes(searchLower) ||
      descStr.includes(searchLower) ||
      sumStr.includes(searchLower) ||
      deptStr.includes(searchLower);

    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const matchCategory = categoryFilter === 'All' || r.category === categoryFilter;

    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  const departmentOptions = [
    'Campus Fire & Life Safety Operations',
    'Campus Electrical & Utility Services',
    'Facilities Management & Maintenance',
    'Campus Security & Safety Operations',
    'Disability & Accessibility Infrastructure',
    'Campus Health & Emergency Medical Services',
    'Campus Environmental & Custodial Services',
    'Campus IT & Audiovisual Infrastructure',
    'General Campus Operations'
  ];

  const statusOptions = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed'
  ];

  const categoryOptions = [
    'Fire Safety',
    'Electrical Issue',
    'Building Maintenance',
    'Security',
    'Medical Assistance',
    'Accessibility',
    'Sanitation',
    'Other'
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Active Disaster Indicator Banner */}
      <DisasterIndicatorBanner />

      {/* Admin Command Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Sliders className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Administration Operations Console • SQLite Persistent Storage
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Campus Operations & Incident Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Review student reports, assign campus departments, dispatch work orders, and broadcast emergency advisories.
          </p>
        </div>

        {/* Header Action Tools */}
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

          {/* Export Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('disaster-indicator')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Disaster Hub</span>
          </button>
        </div>
      </div>

      {/* 6 Core Operational Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Reports</span>
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalReports}</p>
          <p className="text-[10px] text-slate-400">Stored in SQLite</p>
        </div>

        {/* New Triage */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>New Triage</span>
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">{newReports}</p>
          <p className="text-[10px] text-slate-400">Pending review</p>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>In Progress</span>
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressReports}</p>
          <p className="text-[10px] text-slate-400">Active work orders</p>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Resolved</span>
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{resolvedReports}</p>
          <p className="text-[10px] text-slate-400">Repairs completed</p>
        </div>

        {/* Critical */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Critical</span>
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">{criticalReports}</p>
          <p className="text-[10px] text-slate-400">Immediate action</p>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => setActiveTab('disaster-indicator')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-red-300 transition"
        >
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>Active Alerts</span>
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">{activeAlertsCount}</p>
          <p className="text-[10px] text-slate-400">Campus broadcasts</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Incident Category Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Calculated from SQLite DB</span>
          </div>

          <div className="h-60 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No report category data available.
              </div>
            )}
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Incident Priority Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Real-time status</span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry) => (
                      <Cell key={entry.name} fill={priorityColors[entry.name] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC' }}
                  />
                  <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No priority breakdown data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Reports Table vs. System Audit Trail */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setAdminView('reports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            adminView === 'reports'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incident Reports Registry ({filteredReports.length})</span>
        </button>

        <button
          onClick={() => setAdminView('audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            adminView === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Administrative Audit Trail</span>
        </button>
      </div>

      {/* VIEW 1: Reports Table */}
      {adminView === 'reports' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ID, location, summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="All">All Categories</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                    <th className="p-3 font-semibold">Report ID</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Priority</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Location & Summary</th>
                    <th className="p-3 font-semibold">Department</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredReports.map((r) => {
                    const priorityClass =
                      r.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900' :
                      r.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900' :
                      r.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' :
                      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

                    const statusClass =
                      r.status === 'Resolved' || r.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' :
                      r.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' :
                      r.status === 'Assigned' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900' :
                      r.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900' :
                      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {r.id}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            {r.category || 'Other'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${priorityClass}`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusClass}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {r.summary || r.title || r.description}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span>{r.location}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-[180px] truncate">
                          {r.department || 'General Operations'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900 transition flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        No reports matching your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: System Audit Trail Log */}
      {adminView === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Administrative Action Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chronological ledger of administrator incident triage and emergency alert dispatches.
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              title="Refresh audit logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                    <th className="p-3 font-semibold">Timestamp</th>
                    <th className="p-3 font-semibold">Administrator</th>
                    <th className="p-3 font-semibold">Action</th>
                    <th className="p-3 font-semibold">Details</th>
                    <th className="p-3 font-semibold">Target ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                        {log.actor_email}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 max-w-md text-slate-700 dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {log.target_id || '—'}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && !isAuditLoading && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Triage Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {selectedReport.id}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Reporter: {selectedReport.reporterName || selectedReport.reporter_name || 'Alex Rivera'} ({selectedReport.studentEmail || selectedReport.student_email || 'student@campusguardian.demo'})
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedReport.summary || selectedReport.title}
              </h3>
            </div>

            {/* Original Student Observation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Student Incident Observation:
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                "{selectedReport.description}"
              </p>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Location: {selectedReport.location}</span>
                <span>•</span>
                <span>AI Confidence: {selectedReport.confidence || 90}%</span>
              </div>
            </div>

            {/* Admin Work Order Assignment Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Administrative Work Order Controls
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    {statusOptions.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Triage Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Campus Department
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Staff / Officer
                  </label>
                  <input
                    type="text"
                    value={editStaff}
                    onChange={(e) => setEditStaff(e.target.value)}
                    placeholder="e.g. Officer M. Davies (Facilities)"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Administrative Notes (Visible to Student in My Reports)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Electrician team dispatched with replacement LED ballast..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Details (Required when resolving)
                </label>
                <textarea
                  rows={2}
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="e.g. Broken fixture replaced, illuminated stairs tested and cleared."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveReport}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Saving...' : 'Save & Update Work Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
