import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MISSIONS } from '../../data/mockData';
import { 
  Search, 
  Bell, 
  User, 
  Tv, 
  Radio, 
  ChevronDown, 
  CheckCircle2, 
  Activity,
  Layers,
  MapPin,
  ExternalLink,
  Sparkles,
  Cpu
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const { 
    selectedMission, 
    setSelectedMission, 
    searchQuery, 
    setSearchQuery, 
    presentationMode, 
    togglePresentationMode,
    alerts,
    setCurrentPage,
    liveStreaming,
    toggleLiveStreaming,
    operationalMode,
    toggleOperationalMode,
    setIsCreateWorkflowOpen,
    setWorkflowStep
  } = useApp();

  const [showMissionDropdown, setShowMissionDropdown] = useState(false);
  const [showNotificationFlyout, setShowNotificationFlyout] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="h-16 bg-space-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 font-sans">
      {/* Left Area: Mission Selector & Coordinates */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mission Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMissionDropdown(!showMissionDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-slate-700/70 hover:border-cyan-500/50 text-xs font-mono text-slate-200 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold max-w-[160px] sm:max-w-[240px] truncate">
              {selectedMission.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showMissionDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-space-900 border border-cyan-500/30 shadow-2xl p-2 z-50 font-sans">
              <div className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1.5">
                Active Operational Missions
              </div>
              <div className="space-y-1">
                {MISSIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMission(m);
                      setShowMissionDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex flex-col gap-1 ${
                      selectedMission.id === m.id
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                        : 'text-slate-300 hover:bg-space-850'
                    }`}
                  >
                    <div className="font-semibold text-slate-100">{m.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{m.location}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Operational Mode Toggle: REAL PROCESSING vs DEMO MODE (Required by Prompt) */}
        <div className="hidden md:flex items-center p-0.5 rounded-lg bg-space-900 border border-slate-800 font-mono text-[10px]">
          <button
            onClick={() => operationalMode !== 'REAL' && toggleOperationalMode()}
            className={`px-2 py-1 rounded-md transition ${
              operationalMode === 'REAL'
                ? 'bg-cyan-500 text-space-950 font-bold shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Real Processing Mode: Ingest user drone video directly"
          >
            REAL PROCESSING
          </button>
          <button
            onClick={() => operationalMode !== 'DEMO' && toggleOperationalMode()}
            className={`px-2 py-1 rounded-md transition ${
              operationalMode === 'DEMO'
                ? 'bg-amber-400 text-space-950 font-bold shadow-neon-amber'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Demo Mode: Pre-calibrated 4K UAV flight dataset for SIH presentation"
          >
            DEMO MODE
          </button>
        </div>

        {/* System Online Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Center/Right Area: Quick Reconstruct, Search, Mode, Alerts, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Launch "Create Digital Twin" Button in Topbar */}
        <button
          onClick={() => {
            setWorkflowStep(1);
            setIsCreateWorkflowOpen(true);
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold transition shadow-neon-cyan"
          title="Launch 5-step single-pass reconstruction workflow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Create Digital Twin</span>
        </button>

        {/* Search Bar */}
        <div className="relative hidden lg:block w-40 xl:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search spatial layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-space-900 border border-slate-700/80 focus:border-cyan-400 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition font-sans"
          />
        </div>

        {/* Presentation Mode Toggle (Required for SIH) */}
        <button
          onClick={togglePresentationMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-sm ${
            presentationMode
              ? 'bg-cyan-400 text-space-950 shadow-neon-cyan'
              : 'bg-space-900 hover:bg-space-850 text-cyan-400 border border-cyan-500/40'
          }`}
          title="Toggle Judge Presentation Mode (Maximized HUD, high readability)"
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Presentation Mode</span>
        </button>

        {/* Alerts Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationFlyout(!showNotificationFlyout)}
            className="relative p-2 rounded-lg bg-space-900 hover:bg-space-850 border border-slate-700/80 text-slate-300 hover:text-white transition"
            title="System Alerts & Spatial Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Quick Notification Flyout */}
          {showNotificationFlyout && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-space-900 border border-cyan-500/30 shadow-2xl p-3 z-50 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active Alerts ({unreadAlerts.length})
                </span>
                <button
                  onClick={() => {
                    setCurrentPage('alerts');
                    setShowNotificationFlyout(false);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Alert Center</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {alerts.slice(0, 3).map(alt => (
                  <div 
                    key={alt.id}
                    onClick={() => {
                      setCurrentPage('alerts');
                      setShowNotificationFlyout(false);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition ${
                      alt.severity === 'CRITICAL'
                        ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-900/50'
                        : alt.severity === 'WARNING'
                        ? 'bg-amber-950/40 border-amber-500/40 hover:bg-amber-900/50'
                        : 'bg-space-850 border-slate-800 hover:bg-space-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        alt.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-500/20' : 'text-amber-400 bg-amber-500/20'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="text-slate-400">{alt.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-100">{alt.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{alt.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User / Officer Profile Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-none">
              Dr. S. Sharma
            </span>
            <span className="text-[10px] font-mono text-cyan-400 leading-tight">
              ISRO Geospatial Cell
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
