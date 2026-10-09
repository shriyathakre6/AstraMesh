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
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>SIH26158 • Single-Pass Drone Video to 3D Digital Twin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mission Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Transform single-pass UAV video footage into sub-meter accurate 3D geospatial realities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Requested "Create Digital Twin" Primary Action */}
          <button
            onClick={handleStartWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-space-950 font-black text-sm shadow-neon-cyan transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Create Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage('digital-twin')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 font-bold text-xs transition"
          >
            <Box className="w-4 h-4 text-cyan-400" />
            <span>Open 3D Viewer</span>
          </button>
        </div>
      </div>

      {/* User-Friendly "Quick Start" Card (Required by Prompt) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-glass">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Quick Start: Create Your Digital Twin
              </h2>
            </div>
            
            {/* 5 Clear User Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">1. Upload Video</span>
                <span className="text-slate-400 text-[11px] leading-tight block">Single-pass drone MP4/MOV footage</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800">
                <span className="text-slate-300 font-bold block mb-1">2. Add Telemetry</span>
                <span className="text-slate-400 text-[11px] leading-tight block">Optional GPS/IMU/RTK logs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800">
                <span className="text-amber-300 font-bold block mb-1">3. AI Reconstruction</span>
                <span className="text-slate-400 text-[11px] leading-tight block">14-stage automated SfM & depth</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800">
                <span className="text-emerald-300 font-bold block mb-1">4. Review 3D Model</span>
                <span className="text-slate-400 text-[11px] leading-tight block">Dense cloud, mesh & textures</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800">
                <span className="text-cyan-300 font-bold block mb-1">5. Analyze & Measure</span>
                <span className="text-slate-400 text-[11px] leading-tight block">Distance, area & accuracy audit</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleStartWorkflow}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-black text-xs shadow-neon-cyan transition"
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
          color="cyan"
          trend={{ value: "+3 deployed", direction: "up", label: "this week" }}
          onClick={() => setCurrentPage('digital-twin')}
        />
        <StatCard
          title="Data Layers"
          value="12"
          icon={Layers}
          color="blue"
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
        <div className="lg:col-span-2 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-space-850/50">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Interactive 3D Digital Twin Preview
              </span>
              <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                (Click and drag to orbit terrain)
              </span>
            </div>

            <button
              onClick={() => setCurrentPage('digital-twin')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen 3D</span>
            </button>
          </div>

          <div className="flex-1 relative w-full h-full min-h-0">
            <DigitalTwinCanvas
              isMiniPreview={true}
              onExpandFullscreen={() => setCurrentPage('digital-twin')}
            />
          </div>
        </div>

        {/* Right Side: Live Intelligence Feed */}
        <div className="rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                AI ENGINE READY
              </span>
            </div>

            <div className="mt-4 space-y-3 font-sans">
              <div 
                onClick={() => viewZoneIn3D('zone-alpha')}
                className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Terrain Anomaly Detected</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">14:28 IST</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-snug">
                  Accelerated slope creep exceeding 14.2 mm/hr identified in <strong className="text-rose-300">Zone Alpha</strong>. High landslide vulnerability.
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1 group-hover:underline">
                  <span>Inspect Zone Alpha in 3D</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div 
                onClick={() => setCurrentPage('monitoring')}
                className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Monitoring Station Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">14:30 IST</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-snug">
                  8 of 8 IoT telemetry pods reporting nominal heartbeats. Uplink telemetry rate stable at 104.2 kbps.
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1 group-hover:underline">
                  <span>View All Monitoring Stations</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div 
                onClick={() => setCurrentPage('data-layers')}
                className="p-3.5 rounded-xl bg-space-850/80 border border-slate-700/60 hover:border-cyan-500/40 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>New Satellite Layer Processed</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">13:50 IST</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-snug">
                  Copernicus Sentinel-2 MSI multispectral pass orthorectified and draped onto AstraMesh DEM.
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1 group-hover:underline">
                  <span>Manage Spatial Data Layers</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div 
                onClick={() => viewZoneIn3D('zone-gamma')}
                className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>High-Risk Zone Identified</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">12:35 IST</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-snug">
                  Zone Gamma InSAR analysis confirms 6.4 mm seismic shear strain along active fault trace.
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1 group-hover:underline">
                  <span>View Risk Zones in 3D</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-500">
              AstraMesh Core AI v4.2 • Autonomous Spatial Inference
            </span>
          </div>
        </div>
      </div>

      {/* Recent Projects Table (Required by Prompt) */}
      <div className="p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Recent Drone Reconstruction Projects ({recentProjects.length})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">SIH Single-Pass Flight Cache</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-space-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Project Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Video File</th>
                <th className="p-3">Resolution</th>
                <th className="p-3">Processing Status</th>
                <th className="p-3">Model Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {recentProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-space-850/60 transition">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{proj.name}</span>
                  </td>
                  <td className="p-3 text-slate-400">{proj.date}</td>
                  <td className="p-3 text-cyan-300">{proj.videoName}</td>
                  <td className="p-3 text-slate-300">{proj.resolution}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {proj.processingStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {proj.modelStatus} ({proj.pointCount})
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openRecentProject(proj.id)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition"
                    >
                      Open in 3D
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: 3 Recharts Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Data Processing Trend</h4>
              <p className="text-xs text-slate-400">Spatial telemetry ingest rate (points/hr)</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">154 Mbps</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_PROCESSING_TREND}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="pointsProcessed" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Risk Distribution</h4>
              <p className="text-xs text-slate-400">Regional spatial hazard classification</p>
            </div>
            <span className="text-xs font-mono text-rose-400 font-bold">30% Elevated</span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low (Delta): 45%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Moderate (Beta): 25%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /> High (Alpha): 20%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical (Gamma): 10%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Monitoring Activity</h4>
              <p className="text-xs text-slate-400">Ground telemetry node uptime (%)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">96.8% Avg</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONITORING_ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[80, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="uptime" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SIH Storytelling Section: "Why AstraMesh3D?" */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-glass">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Smart India Hackathon 2026 Core Evaluation Framework</span>
        </div>
        <h3 className="text-xl font-extrabold text-white mb-4">
          Why AstraMesh3D?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>1. The Problem</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Complex spatial data is fragmented across separate formats. Traditional photogrammetry requires multi-grid crosshatch flights with heavy compute, making single-pass drone video interpretation difficult.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>2. The Solution</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              AstraMesh3D fuses single-pass UAV video with AI depth and optional GNSS telemetry into a unified 3D digital reality with sub-meter spatial precision and zero user friction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>3. The Innovation</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              14-stage automated pipeline + Laplacian motion blur filtering + Structure-from-Motion trajectory solver + interactive 3D distance/area measurement tools in one browser platform.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>4. The Impact</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Accelerates survey turnaround from days to minutes for disaster relief, infrastructure inspection, defense intelligence, and environmental hazard mitigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
