import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';
import { 
  Box, 
  Layers, 
  MapPin, 
  Bell, 
  Radio, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  ShieldAlert,
  Sparkles,
  Zap,
  Maximize2,
  Video,
  Navigation,
  FolderOpen,
  Clock,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  DATA_PROCESSING_TREND, 
  RISK_DISTRIBUTION_DATA, 
  MONITORING_ACTIVITY_DATA 
} from '../../data/mockData';

export const OverviewPage: React.FC = () => {
  const { 
    setCurrentPage, 
    stations, 
    dataLayers, 
    riskZones, 
    alerts, 
    viewZoneIn3D,
    selectedMission,
    setIsCreateWorkflowOpen,
    setWorkflowStep,
    recentProjects,
    openRecentProject
  } = useApp();

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const handleStartWorkflow = () => {
    setWorkflowStep(1);
    setIsCreateWorkflowOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header with High-Visibility "Create Digital Twin" Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-geo-teal" />
            <span>SIH26158 • Single-Pass Drone Video to 3D Digital Twin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Mission Intelligence Dashboard
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Transform single-pass UAV video footage into sub-meter accurate 3D geospatial realities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white font-bold text-sm shadow-geo-md transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 fill-current" />
            <span>Create Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage('digital-twin')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-geo-bg border border-geo-border text-geo-primary font-bold text-xs shadow-geo-sm transition"
          >
            <Box className="w-4 h-4 text-geo-teal" />
            <span>Open 3D Viewer</span>
          </button>
        </div>
      </div>

      {/* User-Friendly "Quick Start" Card */}
      <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-geo-teal animate-ping" />
              <h2 className="text-sm font-bold text-geo-primary uppercase tracking-wider font-mono">
                Quick Start: Create Your Digital Twin
              </h2>
            </div>
            
            {/* 5 Clear User Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-geo-blue-light border border-geo-border">
                <span className="text-geo-primary font-bold block mb-1">1. Upload Video</span>
                <span className="text-geo-text-sub text-[11px] leading-tight block">Single-pass drone MP4/MOV footage</span>
              </div>
              <div className="p-2.5 rounded-xl bg-geo-bg border border-geo-border">
                <span className="text-geo-text-main font-bold block mb-1">2. Add Telemetry</span>
                <span className="text-geo-text-sub text-[11px] leading-tight block">Optional GPS/IMU/RTK logs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-geo-bg border border-geo-border">
                <span className="text-geo-teal font-bold block mb-1">3. AI Reconstruction</span>
                <span className="text-geo-text-sub text-[11px] leading-tight block">14-stage automated SfM & depth</span>
              </div>
              <div className="p-2.5 rounded-xl bg-geo-mint-light border border-geo-teal/30">
                <span className="text-emerald-700 font-bold block mb-1">4. Review 3D Model</span>
                <span className="text-geo-text-sub text-[11px] leading-tight block">Dense cloud, mesh & textures</span>
              </div>
              <div className="p-2.5 rounded-xl bg-geo-bg border border-geo-border">
                <span className="text-geo-primary font-bold block mb-1">5. Analyze & Measure</span>
                <span className="text-geo-text-sub text-[11px] leading-tight block">Distance, area & accuracy audit</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleStartWorkflow}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-geo-teal hover:bg-geo-teal-hover text-white font-bold text-xs shadow-geo-md transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start New Reconstruction</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Assets"
          value="24"
          icon={Box}
          color="blue"
          trend={{ value: "+3 deployed", direction: "up", label: "this week" }}
          onClick={() => setCurrentPage('digital-twin')}
        />
        <StatCard
          title="Data Layers"
          value="12"
          icon={Layers}
          color="cyan"
          trend={{ value: "100%", direction: "neutral", label: "synchronized" }}
          onClick={() => setCurrentPage('data-layers')}
        />
        <StatCard
          title="Monitored Zones"
          value="08"
          icon={MapPin}
          color="emerald"
          trend={{ value: "4 telemetry cells", direction: "neutral", label: "nominal" }}
          onClick={() => setCurrentPage('monitoring')}
        />
        <StatCard
          title="Active Alerts"
          value={`0${activeAlertsCount}`}
          icon={Bell}
          color="rose"
          trend={{ value: "2 critical", direction: "up", label: "requires action" }}
          onClick={() => setCurrentPage('alerts')}
        />
      </div>

      {/* Main Section: 3D Visualization Preview + Live Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Interactive 3D Visualization Preview (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-geo-border shadow-geo-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-geo-border flex items-center justify-between bg-geo-bg/60">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-geo-teal animate-ping" />
              <span className="text-xs font-bold text-geo-primary uppercase tracking-wider font-mono">
                Interactive 3D Digital Twin Preview
              </span>
              <span className="hidden sm:inline text-[11px] font-mono text-geo-text-sub">
                (Click and drag to orbit terrain)
              </span>
            </div>

            <button
              onClick={() => setCurrentPage('digital-twin')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-geo-primary bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border transition font-semibold"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen 3D</span>
            </button>
          </div>

          <div className="flex-1 relative w-full h-full min-h-0 bg-[#E8EFF7]">
            <DigitalTwinCanvas
              isMiniPreview={true}
              onExpandFullscreen={() => setCurrentPage('digital-twin')}
            />
          </div>
        </div>

        {/* Right Side: Live Intelligence Feed */}
        <div className="rounded-2xl bg-white border border-geo-border shadow-geo-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-geo-border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-geo-teal" />
                <h3 className="text-sm font-bold text-geo-primary uppercase tracking-wider font-mono">
                  Live Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                AI ENGINE READY
              </span>
            </div>

            <div className="mt-4 space-y-3 font-sans">
              <div 
                onClick={() => viewZoneIn3D('zone-alpha')}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 hover:border-rose-300 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Terrain Anomaly Detected</span>
                  </div>
                  <span className="text-[10px] font-mono text-geo-text-sub">14:28 IST</span>
                </div>
                <p className="text-xs text-geo-text-main mt-1.5 leading-snug">
                  Active sub-surface displacement in <strong className="text-rose-700">Zone Alpha (North Ridge)</strong>. Slip rate exceeded 4.2mm/hr.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-rose-600 font-mono font-bold">CRITICAL RISK</span>
                  <span className="text-geo-primary font-semibold flex items-center gap-1 group-hover:underline">
                    Locate in 3D <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div 
                onClick={() => setCurrentPage('monitoring')}
                className="p-3.5 rounded-xl bg-geo-bg border border-geo-border hover:border-geo-primary/40 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-geo-primary font-semibold text-xs">
                    <Activity className="w-4 h-4 text-geo-teal" />
                    <span>Monitoring Station Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-geo-text-sub">14:15 IST</span>
                </div>
                <p className="text-xs text-geo-text-main mt-1.5 leading-snug">
                  Station <strong>Himalayan Base Delta-04</strong> transmitting 50Hz seismic and GNSS displacement telemetry.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-mono font-bold">NOMINAL (99.8%)</span>
                  <span className="text-geo-primary font-semibold flex items-center gap-1 group-hover:underline">
                    View Stream <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div 
                onClick={() => setCurrentPage('data-layers')}
                className="p-3.5 rounded-xl bg-geo-blue-light/50 border border-geo-border hover:border-geo-primary/40 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-geo-primary font-semibold text-xs">
                    <Layers className="w-4 h-4 text-geo-secondary" />
                    <span>New Satellite Layer Synced</span>
                  </div>
                  <span className="text-[10px] font-mono text-geo-text-sub">13:50 IST</span>
                </div>
                <p className="text-xs text-geo-text-main mt-1.5 leading-snug">
                  Cartosat-3 high-resolution multispectral DEM orthomosaic integrated into coordinate grid.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-geo-primary font-mono font-bold">30cm GSD</span>
                  <span className="text-geo-primary font-semibold flex items-center gap-1 group-hover:underline">
                    Inspect Layer <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-geo-border mt-4">
            <button
              onClick={() => setCurrentPage('alerts')}
              className="w-full py-2 rounded-lg bg-geo-bg hover:bg-geo-blue-light text-geo-primary text-xs font-bold transition flex items-center justify-center gap-1.5 border border-geo-border"
            >
              <span>View All 8 Active Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Statistical Intelligence Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Data Processing Trend */}
        <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-geo-primary uppercase tracking-wider font-mono">
                Data Processing Trend
              </h3>
              <p className="text-[11px] text-geo-text-sub">Telemetry throughput (MB/hr)</p>
            </div>
            <span className="text-xs font-mono font-bold text-geo-teal">+18.4%</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_PROCESSING_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234A72" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#234A72" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7EF" />
                <XAxis dataKey="time" stroke="#667085" fontSize={10} tickLine={false} />
                <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E1E7EF', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#1D2939',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#234A72" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorThroughput)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-geo-primary uppercase tracking-wider font-mono">
                Risk Distribution
              </h3>
              <p className="text-[11px] text-geo-text-sub">Zonal hazard classification</p>
            </div>
            <span className="text-xs font-mono font-bold text-geo-primary">4 Sectors</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E1E7EF', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#1D2939'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-geo-text-sub pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-geo-primary" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
            </span>
          </div>
        </div>

        {/* Chart 3: Monitoring Activity */}
        <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-geo-primary uppercase tracking-wider font-mono">
                Monitoring Activity
              </h3>
              <p className="text-[11px] text-geo-text-sub">Hourly sensor telemetry syncs</p>
            </div>
            <span className="text-xs font-mono font-bold text-geo-teal">99.4% Sync</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONITORING_ACTIVITY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7EF" />
                <XAxis dataKey="day" stroke="#667085" fontSize={10} tickLine={false} />
                <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E1E7EF', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#1D2939'
                  }} 
                />
                <Bar dataKey="pings" fill="#368A83" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
