import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Shield,
  GraduationCap,
  KeyRound,
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalDefaultRole,
    closeAuthModal,
    login
  } = useReports();

  const [activeRole, setActiveRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync role when modal opens
  useEffect(() => {
    if (authModalOpen) {
      const initialRole = authModalDefaultRole || 'student';
      setActiveRole(initialRole);
      setErrorMsg('');
      if (initialRole === 'admin') {
        setEmail('admin@campusguardian.demo');
        setPassword('admin123');
      } else {
        setEmail('student@campusguardian.demo');
        setPassword('student123');
      }
    }
  }, [authModalOpen, authModalDefaultRole]);

  if (!authModalOpen) return null;

  const handleSelectRole = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setEmail('admin@campusguardian.demo');
      setPassword('admin123');
    } else {
      setEmail('student@campusguardian.demo');
      setPassword('student123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password.trim());
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xl text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CampusGuardian AI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your role to access the campus safety platform
            </p>
          </div>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5">
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeRole === 'student'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeRole === 'admin'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Operations Admin</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeRole === 'admin' ? 'admin@campusguardian.demo' : 'student@campusguardian.demo'}
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 rounded-lg glass-input text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              Pre-filled credentials for testing:
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
              {activeRole === 'admin' ? 'admin123' : 'student123'}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with SQLite DB...</span>
              </>
            ) : (
              <>
                <span>Sign In as {activeRole === 'admin' ? 'Administrator' : 'Student'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
