import React from 'react';
import { useReports } from '../context/ReportsContext';
import {
  AlertTriangle,
  Flame,
  CloudRain,
  Activity,
  ShieldAlert,
  Wind,
  CheckCircle2,
  ArrowRight,
  Radio,
  MapPin,
  Clock
} from 'lucide-react';

export default function DisasterIndicatorBanner() {
  const {
    activeAlerts,
    criticalActiveAlerts,
    acknowledgedAlertIds,
    acknowledgeAlert,
    setActiveTab,
    currentUser
  } = useReports();

  if (!activeAlerts || activeAlerts.length === 0) return null;

  const topAlert = criticalActiveAlerts.length > 0 ? criticalActiveAlerts[0] : activeAlerts[0];
  const isCritical = topAlert.severity === 'Critical';
  const isAcknowledged = acknowledgedAlertIds.includes(topAlert.id);

  const getCategoryIcon = (category) => {
    switch (category) {
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

  const Icon = getCategoryIcon(topAlert.category);

  return (
    <div className={`mb-6 rounded-2xl border p-4 sm:p-5 transition-all shadow-xl ${
      isCritical
        ? 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-900 border-rose-500/60 shadow-glow-rose animate-pulse-slow'
        : 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/60 border-amber-500/40'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Icon & Content */}
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            isCritical
              ? 'bg-rose-500 text-white animate-bounce-slow'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300">
                <Radio className="w-3 h-3 animate-ping" />
                <span>DISASTER INDICATOR: {topAlert.severity}</span>
              </span>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30">
                Category: {topAlert.category}
              </span>

              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(topAlert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">
              {topAlert.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              {topAlert.message}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-rose-300 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Affected Zone: {topAlert.affected_area}</span>
              </span>
              <span className="text-slate-400">
                Issued by: {topAlert.issuing_admin}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 lg:flex-col lg:items-end flex-shrink-0">
          {currentUser && (
            <button
              onClick={() => acknowledgeAlert(topAlert.id)}
              disabled={isAcknowledged}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isAcknowledged
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-white hover:bg-slate-100 text-slate-950 font-bold active:scale-95 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('disaster-indicator')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
          >
            <span>View Safety Instructions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
