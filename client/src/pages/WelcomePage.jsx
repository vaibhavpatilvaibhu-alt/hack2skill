import React from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Shield,
  GraduationCap,
  KeyRound,
  Radio,
  PhoneCall,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building,
  Activity,
  Bot,
  Zap,
  Clock,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Layers,
  FileText
} from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';
import DisasterIndicatorBanner from '../components/DisasterIndicatorBanner';

export default function WelcomePage() {
  const {
    currentUser,
    openAuthModal,
    setActiveTab,
    activeAlerts,
    publicStats,
    logout
  } = useReports();

  const handleStudentAction = () => {
    if (currentUser?.role === 'student') {
      setActiveTab('dashboard');
    } else {
      openAuthModal('student');
    }
  };

  const handleAdminAction = () => {
    if (currentUser?.role === 'admin') {
      setActiveTab('admin');
    } else {
      openAuthModal('admin');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Active Session Verification Bar */}
      {currentUser ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Authenticated Session</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentUser.role}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <code className="text-blue-600 dark:text-blue-400 font-mono">{currentUser.email}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
              className="px-4 py-2 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <span>Go to {currentUser.role === 'admin' ? 'Administration Console' : 'Student Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
            >
              Switch Account
            </button>
          </div>
        </div>
      ) : null}

      {/* Disaster Indicator Banner */}
      <DisasterIndicatorBanner />

      {/* Hero Welcome Section */}
      <section className="text-center pt-4 sm:pt-8 max-w-4xl mx-auto px-4">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Campus Safety & Operations Management</span>
        </div>

        {/* Brand Name */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            CampusGuardian AI
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 tracking-normal mb-4">
          "A Safer Campus. A Smarter Response."
        </p>

        {/* Overview */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          A unified enterprise platform connecting students and facilities administrators. Report campus hazards with intelligent AI triage, coordinate work orders, and broadcast verified emergency alerts in real time.
        </p>

        {/* Dual Portal Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left mb-10">
          {/* Student Gateway */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 shadow-sm transition flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-900">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <span>Student Incident Portal</span>
                {currentUser?.role === 'student' && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-semibold">
                    Current
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Report broken equipment, lighting hazards, and accessibility obstacles. Receive AI category detection and follow live maintenance updates.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>AI-assisted incident triage & severity scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Personal report history & admin notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Campus disaster alerts & emergency contacts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStudentAction}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <span>{currentUser?.role === 'student' ? 'Open Student Portal' : 'Student Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Gateway */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 shadow-sm transition flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <span>Administration Operations</span>
                {currentUser?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-semibold">
                    Current
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Central command dashboard for safety directors and facility managers to triage reports, dispatch repair staff, and broadcast emergencies.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Review all campus incidents in SQLite DB</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Assign departments, staff, and notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Broadcast Disaster Indicator alerts & all-clears</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleAdminAction}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>{currentUser?.role === 'admin' ? 'Open Admin Console' : 'Administrator Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1-Click Evaluation Credentials Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span><strong>Hackathon Demo Credentials:</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('student')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition"
            >
              student@campusguardian.demo
            </button>
            <button
              onClick={() => openAuthModal('admin')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
            >
              admin@campusguardian.demo
            </button>
          </div>
        </div>
      </section>

      {/* Operational Highlights Grid */}
      <section className="max-w-5xl mx-auto pt-6 px-4">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-6">
          Core Platform Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2 w-fit rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI-Powered Incident Triage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Gemini 2.0 and offline deterministic rule fallback evaluate natural language reports, classifying into 8 standard campus categories with priority scoring.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2 w-fit rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Disaster Indicator Hub
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Campus-wide broadcast system supporting 2-step critical confirmation, student safety acknowledgements, and official all-clear declarations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2 w-fit rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Persistent Audit Logging
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All incident submissions, department assignments, and status updates are persisted in SQLite with chronological audit logs and export options.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
