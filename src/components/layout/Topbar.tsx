import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  Cpu,
  LogOut,
  Shield,
  HelpCircle
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

  const { user, logout } = useAuth();

  const [showMissionDropdown, setShowMissionDropdown] = useState(false);
  const [showNotificationFlyout, setShowNotificationFlyout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="h-16 bg-white border-b border-geo-border px-4 sm:px-6 flex items-center justify-between gap-4 z-20 font-sans shadow-geo-sm">
      {/* Left Area: Mission Selector & Coordinates */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mission Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMissionDropdown(!showMissionDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-geo-bg border border-geo-border hover:border-geo-primary/50 text-xs font-mono text-geo-text-main transition"
          >
            <MapPin className="w-3.5 h-3.5 text-geo-teal" />
            <span className="font-semibold max-w-[160px] sm:max-w-[240px] truncate text-geo-primary">
              {selectedMission.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-geo-text-sub" />
          </button>

          {showMissionDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-white border border-geo-border shadow-geo-xl p-2 z-50 font-sans">
              <div className="text-[10px] font-mono uppercase text-geo-text-sub px-3 py-1.5">
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
                        ? 'bg-geo-blue-light border border-geo-primary/30 text-geo-primary'
                        : 'text-geo-text-main hover:bg-geo-bg'
                    }`}
                  >
                    <div className="font-semibold text-geo-primary">{m.name}</div>
                    <div className="text-[10px] font-mono text-geo-text-sub">{m.location}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Coordinate Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-geo-text-sub pl-2 border-l border-geo-border">
          <span>REGION:</span>
          <span className="text-geo-text-main font-semibold">{selectedMission.location}</span>
          <span className="text-geo-border">|</span>
          <span className="text-geo-teal font-semibold">CRS: {selectedMission.crs}</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-xs relative">
        <Search className="w-4 h-4 text-geo-text-muted absolute left-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coordinates, zones, assets..."
          className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-geo-bg border border-geo-border text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:bg-white transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* "Create Digital Twin" Action Button */}
        <button
          onClick={() => {
            setWorkflowStep(1);
            setIsCreateWorkflowOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-bold shadow-geo-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">Create Digital Twin</span>
          <span className="sm:hidden">Create</span>
        </button>

        {/* System Online Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-geo-mint-light border border-geo-teal/30 text-geo-teal text-[11px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        {/* Presentation Mode Toggle */}
        <button
          onClick={togglePresentationMode}
          className={`p-2 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
            presentationMode 
              ? 'bg-geo-teal text-white shadow-teal-glow font-bold' 
              : 'bg-geo-bg hover:bg-geo-blue-light text-geo-text-sub border border-geo-border'
          }`}
          title="Toggle SIH Guided Presentation Mode"
        >
          <Tv className="w-4 h-4" />
          <span className="hidden xl:inline">{presentationMode ? 'PRESENTATION ACTIVE' : 'PRESENTATION'}</span>
        </button>

        {/* Notifications Icon & Flyout */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationFlyout(!showNotificationFlyout)}
            className="relative p-2 rounded-lg bg-geo-bg hover:bg-geo-blue-light border border-geo-border text-geo-text-sub transition"
            title="System Alerts & Spatial Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotificationFlyout && (
            <div className="absolute top-full right-0 mt-2 w-80 rounded-xl bg-white border border-geo-border shadow-geo-xl p-3 z-50 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-geo-border">
                <span className="text-xs font-bold text-geo-text-main">System Alerts</span>
                <button
                  onClick={() => {
                    setCurrentPage('alerts');
                    setShowNotificationFlyout(false);
                  }}
                  className="text-[11px] text-geo-teal hover:underline flex items-center gap-1"
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
                    className="p-2.5 rounded-lg border border-geo-border hover:bg-geo-bg cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        alt.severity === 'CRITICAL' ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="text-geo-text-sub">{alt.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-geo-text-main">{alt.title}</div>
                    <div className="text-[11px] text-geo-text-sub truncate mt-0.5">{alt.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card & Logout Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-geo-border cursor-pointer hover:opacity-90 transition text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-geo-primary text-white flex items-center justify-center font-bold text-xs shadow-geo-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-semibold text-geo-text-main leading-none">
                {user?.name || 'Dr. Shriya Thakre'}
              </span>
              <span className="text-[10px] font-mono text-geo-teal leading-tight">
                {user?.role || 'Lead Geospatial Scientist'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-geo-text-sub hidden xl:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-white border border-geo-border shadow-geo-xl p-2 z-50 font-sans animate-fade-in">
              <div className="p-2.5 border-b border-geo-border">
                <div className="font-bold text-xs text-geo-text-main">{user?.name || 'Dr. Shriya Thakre'}</div>
                <div className="text-[11px] text-geo-text-sub truncate">{user?.email || 'shriyathakre6@gmail.com'}</div>
                <div className="mt-1 px-1.5 py-0.5 rounded bg-geo-blue-light text-[10px] font-mono text-geo-primary font-semibold w-max">
                  {user?.role || 'Lead Geospatial Scientist'}
                </div>
              </div>

              <div className="py-1">
                <div className="px-2.5 py-1.5 text-[11px] text-geo-text-sub flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-geo-teal" />
                  <span>{user?.organization || 'ISRO Geospatial Intelligence'}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-geo-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
