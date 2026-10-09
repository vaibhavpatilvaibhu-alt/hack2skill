import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Radio,
  AlertTriangle,
  Flame,
  CloudRain,
  Activity,
  Wind,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  Eye,
  Send,
  X,
  FileCheck,
  Check,
  AlertOctagon,
  RefreshCw,
  PhoneCall
} from 'lucide-react';

export default function DisasterIndicatorPage() {
  const {
    alerts,
    activeAlerts,
    acknowledgedAlertIds,
    acknowledgeAlert,
    publishAlert,
    updateAlertStatus,
    refreshAlerts,
    currentUser,
    openAuthModal
  } = useReports();

  const isAdmin = currentUser?.role === 'admin';

  // Admin Broadcast Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCriticalConfirm, setShowCriticalConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Severe Weather');
  const [severity, setSeverity] = useState('Warning');
  const [affectedArea, setAffectedArea] = useState('');
  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('');

  // All-Clear Modal State
  const [allClearModalOpen, setAllClearModalOpen] = useState(false);
  const [selectedAlertToClear, setSelectedAlertToClear] = useState(null);
  const [allClearNotes, setAllClearNotes] = useState('');

  const disasterCategories = [
    'Earthquake',
    'Fire',
    'Flood',
    'Severe Weather',
    'Gas Leak',
    'Medical Emergency',
    'Security Threat',
    'Other Campus Emergency'
  ];

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Fire':
        return Flame;
      case 'Severe Weather':
      case 'Flood':
        return CloudRain;
      case 'Medical Emergency':
        return Activity;
      case 'Earthquake':
        return Wind;
      default:
        return AlertTriangle;
    }
  };

  const handleOpenCreateModal = () => {
    setTitle('');
    setCategory('Severe Weather');
    setSeverity('Warning');
    setAffectedArea('');
    setMessage('');
    setInstructions('1. Follow instructions from building safety wardens.\n2. Do not use elevators during evacuation.\n3. Await all-clear notification before re-entering.');
    setShowPreview(false);
    setShowCriticalConfirm(false);
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !affectedArea.trim() || !message.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (severity === 'Critical') {
      setShowCriticalConfirm(true);
    } else {
      executePublish();
    }
  };

  const executePublish = async () => {
    setIsPublishing(true);
    try {
      await publishAlert({
        title: title.trim(),
        category,
        severity,
        affectedArea: affectedArea.trim(),
        message: message.trim(),
        instructions: instructions.trim()
      });
      setModalOpen(false);
      setShowCriticalConfirm(false);
    } catch (err) {
      alert('Error publishing alert: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleIssueAllClear = async () => {
    if (!selectedAlertToClear) return;
    try {
      await updateAlertStatus(selectedAlertToClear.id, {
        status: 'All-Clear',
        allClearNotes: allClearNotes || 'All clear issued by Campus Operations.'
      });
      setAllClearModalOpen(false);
      setSelectedAlertToClear(null);
      setAllClearNotes('');
    } catch (err) {
      alert('Failed to issue all-clear: ' + err.message);
    }
  };

  const pastAlerts = alerts.filter(a => a.status !== 'Active');

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-navy-900 via-slate-900 to-red-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Radio className="w-4 h-4 animate-ping" />
            </span>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Disaster Indicator & Emergency Alert System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Campus Disaster Indicator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Centralized broadcasting console and safety notification hub for severe weather, structural hazards, fire, and campus emergencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAlerts}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isAdmin ? (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-glow-rose transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast Campus Alert</span>
            </button>
          ) : (
            !currentUser && (
              <button
                onClick={() => openAuthModal('admin')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-semibold"
              >
                <span>Admin Login to Broadcast</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Safety Compliance Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Simulated Alert Protocol:</strong> All emergency alerts published in this demo are marked as <code>[DEMO / SIMULATED]</code>. For actual life-threatening emergencies, always dial 911 / 112.
          </span>
        </div>
      </div>

      {/* Active Alerts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Active Campus Alerts ({activeAlerts.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Real-time verified dispatches
          </span>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const Icon = getCategoryIcon(alert.category);
              const isCritical = alert.severity === 'Critical';
              const isAcknowledged = acknowledgedAlertIds.includes(alert.id);

              return (
                <div
                  key={alert.id}
                  className={`p-6 rounded-2xl border transition shadow-xl ${
                    isCritical
                      ? 'bg-gradient-to-r from-rose-950/80 via-red-950/60 to-slate-900 border-rose-500/60 shadow-glow-rose'
                      : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/50 border-amber-500/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        isCritical ? 'bg-rose-500 text-white animate-bounce-slow' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {alert.severity} ALERT
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-200 border border-slate-700">
                            {alert.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Issued: {new Date(alert.issued_at).toLocaleString()}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white">
                          {alert.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                          {alert.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-300">
                          <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Affected Campus Area: {alert.affected_area}</span>
                          </span>
                          <span className="text-slate-400">
                            Issuing Authority: {alert.issuing_admin}
                          </span>
                        </div>

                        {/* Safety Instructions Box */}
                        {alert.instructions && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                            <span className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                              <span>Recommended Safety Instructions</span>
                            </span>
                            <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                              {alert.instructions}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0 lg:min-w-[180px]">
                      {currentUser && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={isAcknowledged}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                            isAcknowledged
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-white text-slate-950 hover:bg-slate-100 shadow-md active:scale-95'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Alert'}</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedAlertToClear(alert);
                            setAllClearModalOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Declare All-Clear</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-panel text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Campus Zones Normal</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              There are no active emergency alerts currently affecting campus operations.
            </p>
          </div>
        )}
      </section>

      {/* Historical Alerts / All-Clear Log */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Alert History & Resolved Declarations</span>
        </h2>

        {pastAlerts.length > 0 ? (
          <div className="space-y-3">
            {pastAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      All-Clear
                    </span>
                    <span className="text-xs font-bold text-white">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {alert.message}
                  </p>
                  {alert.all_clear_notes && (
                    <p className="text-[11px] text-emerald-400/90 italic">
                      Resolution Note: {alert.all_clear_notes}
                    </p>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                  <p>Resolved: {new Date(alert.all_clear_at || alert.updated_at).toLocaleDateString()}</p>
                  <p className="text-slate-400">Zone: {alert.affected_area}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No historical alerts recorded.</p>
        )}
      </section>

      {/* Admin Broadcast Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel bg-slate-900/95 border border-slate-700/80 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Broadcast Disaster Indicator Alert
                </h3>
                <p className="text-xs text-slate-400">
                  Authorized campus administrator emergency broadcast console
                </p>
              </div>
            </div>

            {/* Live Preview Toggle */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Preview' : 'Preview Live Alert Card'}</span>
              </button>
            </div>

            {/* Preview Card */}
            {showPreview && (
              <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Student Live View Preview:
                </span>
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500 text-white">
                    {severity} • {category}
                  </span>
                  <h4 className="text-base font-bold text-white pt-1">
                    {title || '[Alert Headline]'}
                  </h4>
                  <p className="text-xs text-slate-200">
                    {message || '[Alert details and instructions]'}
                  </p>
                  <p className="text-[11px] text-rose-300 pt-1">
                    Zone: {affectedArea || '[Campus Zone]'}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Disaster Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    {disasterCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Severity Level *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Advisory" className="bg-slate-900 text-white">Advisory (Informational)</option>
                    <option value="Warning" className="bg-slate-900 text-white">Warning (Elevated Risk)</option>
                    <option value="Critical" className="bg-slate-900 text-white">Critical (Immediate Danger)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. [DEMO] Severe Weather & Flash Flood Warning"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Affected Campus Area / Buildings *
                </label>
                <input
                  type="text"
                  required
                  value={affectedArea}
                  onChange={(e) => setAffectedArea(e.target.value)}
                  placeholder="e.g. Science Quad, East Parking Structure, Lower Walkways"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Emergency Broadcast Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed description of the emergency condition and necessary precautions..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recommended Safety Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Actionable steps for students and faculty..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glow-rose transition active:scale-95 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Broadcast Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Critical Confirmation Two-Step Dialog (Requirement #6) */}
      {showCriticalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-rose-950 border-2 border-rose-500 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-600/30 text-rose-300 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <h3 className="text-center text-lg font-extrabold text-white">
              CONFIRM CRITICAL EMERGENCY BROADCAST
            </h3>

            <p className="text-xs text-rose-100 text-center leading-relaxed">
              You are about to issue a <strong>CRITICAL</strong> campus-wide emergency broadcast for:
              <br />
              <strong className="text-white">"{title}"</strong> affecting <strong className="text-white">{affectedArea}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 text-[11px] text-slate-300 border border-rose-500/40">
              ⚠️ This will display immediately with emergency sirens on all student dashboards and audit logs will record your administrator signature.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCriticalConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                Abort
              </button>
              <button
                onClick={executePublish}
                disabled={isPublishing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose"
              >
                {isPublishing ? 'Broadcasting...' : 'Yes, Issue Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All-Clear Declaration Modal */}
      {allClearModalOpen && selectedAlertToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Issue All-Clear Notice for "{selectedAlertToClear.title}"</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resolution & All-Clear Notes
              </label>
              <textarea
                rows={3}
                value={allClearNotes}
                onChange={(e) => setAllClearNotes(e.target.value)}
                placeholder="e.g. Situation safely resolved by emergency crews. Normal campus activities resumed."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setAllClearModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueAllClear}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm All-Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
