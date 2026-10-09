import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Bot,
  SlidersHorizontal,
  Accessibility,
  PhoneCall,
  Radio,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import EmergencyModal from './EmergencyModal';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    openAuthModal,
    systemHealth,
    reports,
    activeAlerts
  } = useReports();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const pendingCount = (reports || []).filter(r => r.status !== 'Resolved' && r.status !== 'Closed').length;
  const isGemini = systemHealth?.aiEngine?.geminiConfigured;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // Nav Items tailored by role
  const navItems = [
    { id: 'welcome', label: 'Welcome', icon: Shield },
    ...(currentUser ? [
      currentUser.role === 'admin'
        ? { id: 'admin', label: 'Operations Hub', icon: SlidersHorizontal }
        : { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'report', label: 'Report Issue', icon: AlertTriangle },
      { id: 'my-reports', label: 'My Reports', icon: FileText, badge: pendingCount > 0 ? pendingCount : null },
    ] : []),
    {
      id: 'disaster-indicator',
      label: 'Disaster Indicator',
      icon: Radio,
      alertCount: (activeAlerts || []).length > 0 ? activeAlerts.length : null
    },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'emergency', label: 'Emergency SOS', icon: PhoneCall, urgent: true },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Top Mini Telemetry Header */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-4 py-1 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">CampusGuardian AI</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">— "A Safer Campus. A Smarter Response."</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* AI Status Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              isGemini
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{isGemini ? 'Gemini 2.0 AI' : 'Local AI Engine'}</span>
            </div>

            {/* Compact Theme Selector */}
            <ThemeSelector compact={true} />

            {/* User Session Status */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentUser.role}
                </span>
                <button
                  onClick={logout}
                  title="Sign out of your session"
                  className="text-slate-400 hover:text-red-600 ml-1 p-0.5 transition"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('student')}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition"
                >
                  Student Login
                </button>
                <button
                  onClick={() => openAuthModal('admin')}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('welcome')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  CampusGuardian
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  AI
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                      : item.urgent
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>

                  {/* Active Alerts Pill */}
                  {item.alertCount && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                      {item.alertCount}
                    </span>
                  )}

                  {/* Pending Reports Badge */}
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS Dispatch</span>
            </button>

            {currentUser ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('student')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
              title="SOS Emergency"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Emergency Modal */}
      {emergencyModalOpen && (
        <EmergencyModal onClose={() => setEmergencyModalOpen(false)} />
      )}
    </>
  );
}
