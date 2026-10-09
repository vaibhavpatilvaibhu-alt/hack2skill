import React from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  Laptop,
  Contrast,
  Type,
  Shield,
  Sparkles,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Sliders,
  LogOut,
  KeyRound,
  GraduationCap
} from 'lucide-react';

export default function SettingsPage() {
  const {
    currentUser,
    logout,
    openAuthModal,
    theme,
    setTheme,
    systemHealth,
    accessibilitySettings,
    updateAccessibilitySettings,
    addToast
  } = useReports();

  const isGemini = systemHealth?.aiEngine?.geminiConfigured;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Application Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">System & Appearance Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your theme, display contrast preferences, session account, and view AI runtime status.
        </p>
      </div>

      {/* 1. User Session Profile Section */}
      <div className="p-6 rounded-3xl glass-panel space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">User Session Profile</h2>
        </div>

        {currentUser ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md ${
                currentUser.role === 'admin'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-glow-purple'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow-blue'
              }`}>
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-base">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  Role: {currentUser.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-bold text-white text-sm">Guest Session</p>
              <p className="text-xs text-slate-400">Sign in to submit and track reports or manage administration.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openAuthModal('student')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Student Sign In
              </button>
              <button
                onClick={() => openAuthModal('admin')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Admin Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Theme Selection (Requirement #5) */}
      <div className="p-6 rounded-3xl glass-panel space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Sun className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Appearance & Theme Selection</h2>
        </div>

        <p className="text-xs text-slate-400">
          Choose your interface preference. The entire application updates immediately and persists your selection across browser restarts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light Mode */}
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
              theme === 'light'
                ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Light Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">High clarity daylight palette</p>
            </div>
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
              theme === 'dark'
                ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Dark Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cyber navy nocturnal theme</p>
            </div>
          </button>

          {/* System Default */}
          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
              theme === 'system'
                ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">System Default</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Synchronize with OS preference</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Accessibility Options */}
      <div className="p-6 rounded-3xl glass-panel space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Contrast className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Visual Accessibility Options</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">High Contrast Display</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Enhanced borders & pure blacks</p>
            </div>
            <input
              type="checkbox"
              checked={accessibilitySettings.highContrast}
              onChange={(e) => updateAccessibilitySettings({ highContrast: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Font Size Scaling</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Adjust text readability size</p>
            </div>
            <select
              value={accessibilitySettings.fontSize}
              onChange={(e) => updateAccessibilitySettings({ fontSize: e.target.value })}
              className="px-2 py-1 rounded-lg glass-input text-xs"
            >
              <option value="normal">Normal (100%)</option>
              <option value="large">Large (115%)</option>
              <option value="xl">Extra Large (130%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. AI Engine & System Runtime Diagnostics */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">AI Engine & System Diagnostics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Backend AI Status</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">
              {isGemini ? 'Gemini 2.0 Flash (Online)' : 'Local Fallback RuleEngine (Active)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Database Layer</span>
            <span className="font-bold text-blue-400 mt-0.5 block">
              SQLite (node:sqlite DatabaseSync)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Session Policy</span>
            <span className="font-bold text-purple-400 mt-0.5 block">
              7-Day Scrypt Secure Token
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
