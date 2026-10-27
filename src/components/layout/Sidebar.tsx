import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import { 
  LayoutDashboard, 
  Box, 
  Layers, 
  Cpu, 
  Activity, 
  Bell, 
  FileText,
  Shield,
  Zap,
  Globe2,
  Compass,
  Video
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, alerts, stations, presentationMode } = useApp();

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
  const activeStations = stations.filter(s => s.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital-twin', label: '3D Digital Twin', icon: Box, badge: 'PROTOTYPE' },
    { id: 'data-layers', label: 'Data Layers', icon: Layers, badge: '12' },
    { id: 'analysis', label: 'Analysis', icon: Cpu },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, badge: `${activeStations}/${stations.length}` },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : undefined },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className={`flex flex-col bg-white border-r border-geo-border transition-all duration-300 z-20 shadow-geo-sm ${
      presentationMode ? 'w-20' : 'w-64'
    }`}>
      {/* Brand & Project Tag */}
      <div className="p-4 border-b border-geo-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-geo-primary p-0.5 shadow-geo-sm flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-geo-primary rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '30s' }} />
            </div>
          </div>
          
          {!presentationMode && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base tracking-wider text-geo-primary">
                  ASTRAMESH<span className="text-geo-teal">3D</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-geo-secondary tracking-wider font-semibold">
                SIH26158 • DIGITAL TWIN
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className={`px-3 py-1.5 text-[10px] font-mono tracking-widest text-geo-text-sub uppercase ${
          presentationMode ? 'text-center' : ''
        }`}>
          {presentationMode ? 'NAV' : 'MAIN NAVIGATION'}
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-geo-blue-light text-geo-primary font-bold shadow-geo-sm border border-geo-border'
                  : 'text-geo-text-sub hover:text-geo-text-main hover:bg-geo-bg'
              } ${presentationMode ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 transition ${
                isActive ? 'text-geo-primary' : 'text-geo-text-sub group-hover:text-geo-primary'
              }`} />

              {!presentationMode && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-geo-primary text-white'
                        : 'bg-geo-blue-light text-geo-primary border border-geo-border'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Single-Pass Workflow Badge (Bottom Card) */}
      {!presentationMode && (
        <div className="p-3 border-t border-geo-border">
          <div className="p-3 rounded-xl bg-geo-mint-light border border-geo-teal/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-geo-teal">
              <Compass className="w-3.5 h-3.5" />
              <span>SIH Problem SIH26158</span>
            </div>
            <p className="text-[11px] text-geo-text-sub leading-snug">
              Single-Pass Drone Video to 3D Digital Twin System.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
