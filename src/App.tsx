import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { PresentationBanner } from './components/layout/PresentationBanner';
import { ToastContainer } from './components/common/Toast';
import { CreateDigitalTwinModal } from './components/workflow/CreateDigitalTwinModal';
import { OverviewPage } from './components/pages/OverviewPage';
import { DigitalTwinPage } from './components/pages/DigitalTwinPage';
import { DataLayersPage } from './components/pages/DataLayersPage';
import { AnalysisPage } from './components/pages/AnalysisPage';
import { MonitoringPage } from './components/pages/MonitoringPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { AstraMeshChatbot } from './components/chatbot/AstraMeshChatbot';
import { Globe2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentPage, isCreateWorkflowOpen, setIsCreateWorkflowOpen } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-geo-bg text-geo-primary font-sans">
        <div className="w-12 h-12 rounded-2xl bg-geo-primary text-white flex items-center justify-center shadow-geo-md mb-4 animate-bounce">
          <Globe2 className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <div className="font-extrabold text-base tracking-wider text-geo-primary">
          ASTRAMESH<span className="text-geo-teal">3D</span>
        </div>
        <div className="text-xs font-mono text-geo-text-sub mt-1">
          Loading Geospatial Intelligence Environment...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'digital-twin':
        return <DigitalTwinPage />;
      case 'data-layers':
        return <DataLayersPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-geo-bg text-geo-text-main select-none font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Execution Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <Topbar />

        {/* SIH Guided Presentation Tour Banner */}
        <PresentationBanner />

        {/* Page Content Viewport */}
        <main className={`flex-1 overflow-y-auto bg-geo-bg ${
          currentPage === 'digital-twin' ? 'p-3' : 'p-4 sm:p-6'
        }`}>
          {renderCurrentPage()}
        </main>

        {/* 5-Step Create Digital Twin Master Modal Wizard */}
        <CreateDigitalTwinModal 
          isOpen={isCreateWorkflowOpen} 
          onClose={() => setIsCreateWorkflowOpen(false)} 
        />

        {/* Global Toast Notifications */}
        <ToastContainer />

        {/* Floating Working AI Chatbot: ASTRAMESH AI Assistant */}
        <AstraMeshChatbot />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
