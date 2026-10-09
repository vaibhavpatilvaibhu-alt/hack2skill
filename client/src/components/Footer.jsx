import React from 'react';
import { useReports } from '../context/ReportsContext';
import { Shield, Sparkles, Radio, Phone, ExternalLink } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Footer() {
  const { setActiveTab } = useReports();

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 dark:bg-navy-950/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">CampusGuardian AI</span>
            </div>
            <p className="text-blue-200/90 text-xs font-medium leading-relaxed">
              "A Safer Campus. A Smarter Response."
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-blue-400">
              <Sparkles className="w-3 h-3" />
              <span>Smart Campus Solutions Track</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('welcome')} className="hover:text-blue-400 transition">
                  Welcome & Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('report')} className="hover:text-blue-400 transition">
                  Report Campus Issue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('my-reports')} className="hover:text-blue-400 transition">
                  My Reports & Work Orders
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('disaster-indicator')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-rose-500" />
                  <span>Disaster Indicator Hub</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('assistant')} className="hover:text-blue-400 transition">
                  GuardianBot AI Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Safety & Emergency */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Safety & Hotlines</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('emergency')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-rose-500" />
                  <span>Campus Emergency SOS</span>
                </button>
              </li>
              <li>
                <span className="text-slate-300">Security Patrol: <strong>555-0199</strong></span>
              </li>
              <li>
                <span className="text-slate-300">Medical Center: <strong>555-0188</strong></span>
              </li>
              <li>
                <button onClick={() => setActiveTab('accessibility')} className="hover:text-blue-400 transition">
                  Accessibility Accommodations
                </button>
              </li>
            </ul>
          </div>

          {/* System & Theme */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Appearance & Theme</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Switch themes anytime. Preferences persist automatically across browser sessions.
            </p>
            <ThemeSelector />
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            Built for Engineering Hackathon • CampusGuardian AI — "A Safer Campus. A Smarter Response."
          </p>
          <p className="text-center sm:text-right text-slate-400">
            Emergency Notice: Fictional campus demonstration. For genuine life-threatening emergencies, dial 911 / 112.
          </p>
        </div>
      </div>
    </footer>
  );
}
