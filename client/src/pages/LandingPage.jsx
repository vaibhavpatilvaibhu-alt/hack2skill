import React from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Shield,
  AlertTriangle,
  Bot,
  PhoneCall,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Accessibility,
  Activity,
  Layers,
  Cpu,
  Zap,
  Users,
  Compass
} from 'lucide-react';

export default function LandingPage() {
  const { setActiveTab, reports } = useReports();

  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved').length;
  const criticalReports = reports.filter(r => r.priority === 'Critical').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 88;

  const quickExamples = [
    { text: 'The staircase light near Block C has been broken for three days and it is very dark at night.', loc: 'Block C - Staircase 2nd Floor' },
    { text: 'Wheelchair access ramp at North Library entrance is obstructed by heavy delivery crates.', loc: 'Central Library - North Ramp' },
    { text: 'Projector HDMI port in Hall 302 sparks when plugged in during lecture.', loc: 'Science Complex - Hall 302' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/25 to-purple-600/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
          {/* Track Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>HACKATHON TRACK: SMART CAMPUS SOLUTIONS</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-4">
            CampusGuardian{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-blue-200/90 tracking-wide mb-6">
            "A Safer. Smarter. More Accessible Campus."
          </p>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-10">
            Empowering students and faculty to report physical hazards, accessibility barriers, and facility malfunctions in natural plain language. Our AI engine automatically triages urgency, identifies the responsible department, and coordinates transparent resolution.
          </p>

          {/* Core Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-glow-blue transition-all duration-200 active:scale-95 group text-sm"
            >
              <AlertTriangle className="w-4 h-4 text-blue-200 group-hover:scale-110 transition" />
              <span>Report Campus Issue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 active:scale-95 text-sm"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 shadow-glow-rose transition-all duration-200 active:scale-95 text-sm animate-pulse-slow"
            >
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Campus Emergency Hotlines</span>
            </button>
          </div>

          {/* Live Campus Telemetry Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel text-left">
            <div className="p-3 border-r border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Total Logged
              </p>
              <p className="text-2xl font-bold text-white mt-1">{totalReports}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Real-time synced</p>
            </div>

            <div className="p-3 sm:border-r border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolution Rate
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{resolutionRate}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Campus benchmark</p>
            </div>

            <div className="p-3 border-r border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Critical Active
              </p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{criticalReports}</p>
              <p className="text-[10px] text-rose-300 mt-0.5">Under rapid action</p>
            </div>

            <div className="p-3">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> AI Triage Time
              </p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">&lt; 1.2s</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Autonomous routing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Try-It Prompt Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-navy-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Experience Natural Language Reporting</h3>
            </div>
            <span className="text-xs text-slate-400">Click any example to test instant AI triage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickExamples.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveTab('report')}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition text-left group flex flex-col justify-between"
              >
                <p className="text-xs text-slate-300 italic line-clamp-3 mb-3 group-hover:text-white transition">
                  "{item.text}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-blue-400 pt-2 border-t border-slate-900">
                  <span className="truncate max-w-[170px]">{item.loc}</span>
                  <span className="font-semibold group-hover:translate-x-0.5 transition">Triage →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Architectural Workflow</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">How CampusGuardian AI Operates</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            From natural voice or typed complaints to physical work order fulfillment in four transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">Natural Reporting</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students state what is wrong in plain everyday language without needing complex university administrative codes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-indigo-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">AI Classification</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemini AI & our local rule engine analyze severity, determine priority (Critical to Low), and calculate confidence score.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-purple-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">Department Dispatch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Issues route to Facilities, Campus Security, IT Support, or Disability Services with recommended corrective actions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-white mb-2">Lifecycle Tracking</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students receive a unique Report ID to observe live status progression from Submitted to Resolved.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Core Capabilities</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Student Trust & Campus Agility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/30 transition">
            <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Safety Triage</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Distinguishes between routine repairs and urgent physical risks (dark stairwells, broken locks, active hazards) within milliseconds.
            </p>
            <span className="text-xs text-blue-400 font-semibold cursor-pointer" onClick={() => setActiveTab('report')}>
              Try Issue Reporter →
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Accessibility Guardian</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Prioritizes blocked ramps, broken lifts, tactile paving faults, and audio induction loop failures to ensure barrier-free education.
            </p>
            <span className="text-xs text-purple-400 font-semibold cursor-pointer" onClick={() => setActiveTab('accessibility')}>
              Explore Accessibility Hub →
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">24/7 AI Campus Assistant</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Answers campus navigation, lost and found inquiries, facility regulations, and provides 1-click action triggers right in conversation.
            </p>
            <span className="text-xs text-cyan-400 font-semibold cursor-pointer" onClick={() => setActiveTab('assistant')}>
              Start Conversing →
            </span>
          </div>
        </div>
      </section>

      {/* Quick Launch CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 shadow-glow-blue text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to make our campus safer together?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
              Notice a problem right now? Submit an issue with our AI analyzer or consult the campus emergency directory.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('report')}
                className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg text-sm"
              >
                Submit a Campus Report Now
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition text-sm"
              >
                Go to Student Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
