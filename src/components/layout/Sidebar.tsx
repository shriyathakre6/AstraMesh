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
  Globe2
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
    <aside className={`flex flex-col bg-space-950/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 z-20 ${
      presentationMode ? 'w-20' : 'w-64'
    }`}>
      {/* Brand & Project Tag */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-neon-cyan flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </div>
          
          {!presentationMode && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">ASTRAMESH<span className="text-cyan-400">3D</span></span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider font-semibold">
                SIH26158 • DIGITAL TWIN
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className={`px-3 py-1.5 text-[10px] font-mono tracking-widest text-slate-500 uppercase ${
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
              title={presentationMode ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-850/60'
              } ${presentationMode ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-cyan-400' : 'text-slate-400'
              }`} />

              {!presentationMode && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold ${
                      item.id === 'alerts' && unacknowledgedAlerts > 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-space-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Mission Status Pod */}
      <div className="p-3 border-t border-slate-800/80 bg-space-900/50">
        {!presentationMode ? (
          <div className="p-3 rounded-lg bg-space-850/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">SIH Hackathon 2026</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              AstraMesh3D: Transforming Complex Spatial Data into an Intelligent 3D Reality.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 pt-1 border-t border-slate-800">
              <span>BUILD: v1.0-SIH</span>
              <span className="text-emerald-400">ISRO-CRS COMPLIANT</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
