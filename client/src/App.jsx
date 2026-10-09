import React from 'react';
import { useReports } from './context/ReportsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import WelcomePage from './pages/WelcomePage';
import StudentDashboard from './pages/StudentDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import MyReportsPage from './pages/MyReportsPage';
import DisasterIndicatorPage from './pages/DisasterIndicatorPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyCenter from './pages/EmergencyCenter';
import AccessibilityCenter from './pages/AccessibilityCenter';
import SettingsPage from './pages/SettingsPage';

function MainContent() {
  const { activeTab } = useReports();

  const renderPage = () => {
    switch (activeTab) {
      case 'welcome':
        return <WelcomePage />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'report':
        return <ReportIssuePage />;
      case 'my-reports':
        return <MyReportsPage />;
      case 'disaster-indicator':
        return <DisasterIndicatorPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'assistant':
        return <AIAssistantPage />;
      case 'emergency':
        return <EmergencyCenter />;
      case 'accessibility':
        return <AccessibilityCenter />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WelcomePage />;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1 w-full">
      <ErrorBoundary key={activeTab}>
        {renderPage()}
      </ErrorBoundary>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#060913] dark:text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <div>
        <Navbar />
        <MainContent />
      </div>
      <Footer />
      <ToastContainer />
      <AuthModal />
    </div>
  );
}
