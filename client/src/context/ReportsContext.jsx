import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  checkBackendHealth,
  loginUser,
  fetchCurrentUser,
  logoutUser,
  fetchServerReports,
  postServerReport,
  patchServerReport,
  fetchServerAlerts,
  postServerAlert,
  patchServerAlert,
  acknowledgeServerAlert,
  fetchAcknowledgedAlerts,
  fetchPublicStats
} from '../services/api';

const ReportsContext = createContext(null);
const TOKEN_KEY = 'campusguardian_auth_token';
const THEME_KEY = 'campusguardian_theme_mode';
const SETTINGS_KEY = 'campusguardian_settings_v1';

export function ReportsProvider({ children }) {
  // 1. Navigation State - Default to 'welcome'
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'welcome';
  });

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync hash changes with browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // 2. Authentication State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState('student');

  const openAuthModal = (defaultRole = 'student') => {
    setAuthModalDefaultRole(defaultRole);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // 3. Theme State ('dark' | 'light' | 'system')
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  const applyThemeToDOM = useCallback((themeMode) => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, []);

  const setTheme = (mode) => {
    setThemeState(mode);
    localStorage.setItem(THEME_KEY, mode);
    applyThemeToDOM(mode);
  };

  // Listen to system theme changes if theme === 'system'
  useEffect(() => {
    applyThemeToDOM(theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyThemeToDOM('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyThemeToDOM]);

  // 4. Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (title, message = '', type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 5. System Health & Public Stats
  const [systemHealth, setSystemHealth] = useState({
    status: 'checking',
    aiEngine: { activeModel: 'Initializing...' }
  });
  const [publicStats, setPublicStats] = useState({
    totalReports: 5,
    resolvedReports: 1,
    inProgress: 3,
    activeAlerts: 1,
    resolutionRate: 85
  });

  // 6. Reports & Disaster Alerts State
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState([]);

  // Refresh reports from server
  const refreshReports = useCallback(async (token = authToken) => {
    if (!token) return;
    const data = await fetchServerReports(token);
    if (data && Array.isArray(data)) {
      setReports(data);
    }
  }, [authToken]);

  // Refresh alerts from server
  const refreshAlerts = useCallback(async () => {
    const alertData = await fetchServerAlerts();
    if (alertData && Array.isArray(alertData)) {
      setAlerts(alertData);
    }
  }, []);

  // 7. Initial Session Restore
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsAuthLoading(true);

      // Fetch health & public stats
      const [health, pStats, alertData] = await Promise.all([
        checkBackendHealth(),
        fetchPublicStats(),
        fetchServerAlerts()
      ]);

      if (isMounted) {
        if (health) setSystemHealth(health);
        if (pStats) setPublicStats(pStats);
        if (alertData) setAlerts(alertData);
      }

      // Check stored session
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        const sessionData = await fetchCurrentUser(savedToken);
        if (isMounted && sessionData?.user) {
          setCurrentUser(sessionData.user);
          setAuthToken(savedToken);

          // Fetch user reports & acknowledgements
          const [userReports, ackIds] = await Promise.all([
            fetchServerReports(savedToken),
            fetchAcknowledgedAlerts(savedToken)
          ]);
          if (isMounted && userReports) setReports(userReports);
          if (isMounted && ackIds) setAcknowledgedAlertIds(ackIds);
        } else {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          if (isMounted) {
            setAuthToken(null);
            setCurrentUser(null);
          }
        }
      }

      if (isMounted) setIsAuthLoading(false);
    }

    initAuth();
    return () => { isMounted = false; };
  }, []);

  // Auto-refresh alerts periodically (every 12 seconds for real-time awareness)
  useEffect(() => {
    const timer = setInterval(() => {
      refreshAlerts();
    }, 12000);
    return () => clearInterval(timer);
  }, [refreshAlerts]);

  // 8. Auth Actions
  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      setAuthToken(result.token);
      setCurrentUser(result.user);

      // Load user's reports & acknowledgements
      const [userReports, ackIds] = await Promise.all([
        fetchServerReports(result.token),
        fetchAcknowledgedAlerts(result.token)
      ]);
      if (userReports) setReports(userReports);
      if (ackIds) setAcknowledgedAlertIds(ackIds);

      addToast('Welcome to CampusGuardian AI', `Signed in as ${result.user.name} (${result.user.role.toUpperCase()})`, 'success');

      // Route to role-specific dashboard
      if (result.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }

      return result;
    } catch (err) {
      addToast('Authentication Failed', err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (authToken) {
        await logoutUser(authToken);
      }
    } catch (e) {}

    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    setReports([]);
    setActiveTab('welcome');
    addToast('Signed Out', 'Your session has been securely ended.', 'info');
  };

  // 9. Report Operations
  const addReport = async (reportData) => {
    try {
      const created = await postServerReport(reportData, authToken);
      setReports(prev => [created, ...prev]);
      addToast('Incident Report Filed', `Tracking ID: ${created.id}`, 'success');
      // Refresh public telemetry
      fetchPublicStats().then(s => s && setPublicStats(s));
      return created;
    } catch (err) {
      addToast('Submission Error', err.message, 'error');
      throw err;
    }
  };

  const updateReport = async (id, updates) => {
    try {
      const updated = await patchServerReport(id, updates, authToken);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      addToast('Report Updated', `Report ${id} status updated to ${updated.status}`, 'success');
      return updated;
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
      throw err;
    }
  };

  // 10. Alert Operations
  const publishAlert = async (alertData) => {
    try {
      const created = await postServerAlert(alertData, authToken);
      setAlerts(prev => [created, ...prev]);
      addToast('Disaster Alert Broadcast', `Published: ${created.title} (${created.severity})`, 'warning');
      return created;
    } catch (err) {
      addToast('Broadcast Error', err.message, 'error');
      throw err;
    }
  };

  const updateAlertStatus = async (id, updates) => {
    try {
      const updated = await patchServerAlert(id, updates, authToken);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
      addToast('Alert Updated', `Alert ${id} updated to ${updated.status}`, 'info');
      return updated;
    } catch (err) {
      addToast('Alert Update Failed', err.message, 'error');
      throw err;
    }
  };

  const acknowledgeAlert = async (id) => {
    try {
      await acknowledgeServerAlert(id, authToken);
      setAcknowledgedAlertIds(prev => [...new Set([...prev, id])]);
      addToast('Alert Acknowledged', 'Your acknowledgement has been recorded by campus safety.', 'success');
    } catch (err) {
      addToast('Acknowledgement Failed', err.message, 'error');
    }
  };

  // Accessibility Settings
  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: false,
      soundCues: false
    };
  });

  const updateAccessibilitySettings = (newSettings) => {
    setAccessibilitySettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Computed alert badges
  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const criticalActiveAlerts = activeAlerts.filter(a => a.severity === 'Critical');

  return (
    <ReportsContext.Provider value={{
      // Navigation
      activeTab,
      setActiveTab,

      // Authentication
      currentUser,
      authToken,
      isAuthLoading,
      login,
      logout,
      userRole: currentUser?.role || 'guest',

      // Auth Modal
      authModalOpen,
      authModalDefaultRole,
      openAuthModal,
      closeAuthModal,

      // Theme
      theme,
      setTheme,

      // Reports
      reports,
      addReport,
      updateReport,
      refreshReports,

      // Disaster Alerts
      alerts,
      activeAlerts,
      criticalActiveAlerts,
      acknowledgedAlertIds,
      publishAlert,
      updateAlertStatus,
      acknowledgeAlert,
      refreshAlerts,

      // Telemetry & Toasts
      systemHealth,
      publicStats,
      toasts,
      addToast,
      removeToast,

      // Accessibility
      accessibilitySettings,
      updateAccessibilitySettings
    }}>
      <div className={`${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${
        accessibilitySettings.fontSize === 'large' ? 'text-lg' : accessibilitySettings.fontSize === 'xl' ? 'text-xl' : 'text-base'
      }`}>
        {children}
      </div>
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) throw new Error('useReports must be used within a ReportsProvider');
  return context;
}
