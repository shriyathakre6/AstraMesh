import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

const AppContent: React.FC = () => {
  const { currentPage, isCreateWorkflowOpen, setIsCreateWorkflowOpen } = useApp();

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
    <div className="flex h-screen w-screen overflow-hidden bg-space-950 text-slate-100 select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Execution Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <Topbar />

        {/* SIH Guided Presentation Tour Banner */}
        <PresentationBanner />

        {/* Page Content Viewport */}
        <main className={`flex-1 overflow-y-auto ${
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
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
