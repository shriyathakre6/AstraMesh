import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Ruler, 
  Maximize2, 
  Mountain, 
  Activity, 
  ShieldAlert, 
  History, 
  Flame, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  RefreshCw,
  Box,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const AnalysisPage: React.FC = () => {
  const { 
    analysisState, 
    setAnalysisState, 
    runRiskAnalysisDemo, 
    viewZoneIn3D, 
    riskZones, 
    selectedMission 
  } = useApp();

  const [selectedTool, setSelectedTool] = useState<string>('risk');
  const [targetZone, setTargetZone] = useState<string>('zone-alpha');

  const tools = [
    { id: 'risk', name: 'Risk Analysis', icon: ShieldAlert, desc: 'Multi-criteria spatial hazard & terrain vulnerability model' },
    { id: 'distance', name: 'Distance Measurement', icon: Ruler, desc: '3D geodetic distance & slope distance calculator' },
    { id: 'area', name: 'Area Measurement', icon: Maximize2, desc: 'Planar & 3D surface area triangulation' },
    { id: 'elevation', name: 'Elevation Profile', icon: Mountain, desc: 'Cross-sectional topography & gradient curve' },
    { id: 'terrain', name: 'Terrain Analysis', icon: Activity, desc: 'Slope aspect, curvature, and roughness indices' },
    { id: 'change', name: 'Change Detection', icon: History, desc: 'Bi-temporal satellite & LiDAR differential analysis' },
    { id: 'hotspot', name: 'Hotspot Detection', icon: Flame, desc: 'Spatial clustering of thermal & deformation anomalies' },
  ];

  const processingMessages = [
    'Initializing spatial compute kernel...',
    'Analyzing spatial layers...',
    'Calculating terrain parameters...',
    'Evaluating risk indicators...',
    'Generating result...',
  ];

  // Dummy profile data for elevation tool
  const ELEVATION_PROFILE_DATA = [
    { distance: '0m', elevation: 680, slope: 4 },
    { distance: '250m', elevation: 720, slope: 12 },
    { distance: '500m', elevation: 790, slope: 28 },
    { distance: '750m', elevation: 842, slope: 44.5 },
    { distance: '1000m', elevation: 910, slope: 38 },
    { distance: '1250m', elevation: 870, slope: 18 },
    { distance: '1500m', elevation: 820, slope: 10 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Spatial Compute Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Spatial Analysis Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Run multi-parametric risk assessments, elevation profiling, and cross-layer spatial inference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40">
            GPU COMPUTE CLUSTER READY
          </span>
        </div>
      </div>

      {/* Analysis Tools Palette (Horizontal Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/10 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                  : 'bg-space-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-space-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight text-white">{tool.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-2 mt-1 hidden sm:block">
                  {tool.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters & Execution Console (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Analysis Parameters
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">TOOL: RISK ENGINE</span>
            </div>

            {/* Input Selection */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                Target Spatial Zone
              </label>
              <select
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-space-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {riskZones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.level} RISK)
                  </option>
                ))}
              </select>
            </div>

            {/* Layer Weights / Inputs */}
            <div className="space-y-2 text-xs font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fused Layer Inputs (Multi-Spectral)
              </span>
              <div className="p-3 rounded-lg bg-space-950 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Cartosat-3 DEM (Slope & Roughness)</span>
                  <span className="text-cyan-300 font-bold">Weight: 35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>InSAR Ground Deformation Track</span>
                  <span className="text-cyan-300 font-bold">Weight: 25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>IoT Ground Moisture & Temp (AST-04)</span>
                  <span className="text-cyan-300 font-bold">Weight: 20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>4K UAV Drone Videogrammetry Recon</span>
                  <span className="text-cyan-300 font-bold">Weight: 20%</span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={runRiskAnalysisDemo}
              disabled={analysisState.isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-space-950 font-extrabold text-sm shadow-neon-cyan flex items-center justify-center gap-2 transition"
            >
              {analysisState.isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Spatial Layers...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Risk Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-space-850/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>SIH Evaluation Note</span>
            </div>
            <p className="leading-relaxed">
              Clicking <strong>"Execute Risk Analysis"</strong> runs our multi-factor spatial hazard pipeline. Once completed, judges can click <strong>"View in 3D"</strong> to automatically fly the camera to the affected risk zone!
            </p>
          </div>
        </div>

        {/* Right Side: Analysis Output & Processing Animation (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Processing State Animation */}
          {analysisState.isProcessing && (
            <div className="p-8 rounded-2xl bg-space-900/90 backdrop-blur-md border border-cyan-500/40 shadow-2xl flex flex-col items-center justify-center min-h-[440px] text-center font-mono">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mb-6" />
              
              <h3 className="text-lg font-bold text-white mb-2">
                Running Autonomous Spatial Inference
              </h3>

              {/* Progress Steps List */}
              <div className="space-y-2 text-xs max-w-sm w-full text-left mt-4">
                {[
                  'Analyzing spatial layers...',
                  'Calculating terrain parameters...',
                  'Evaluating risk indicators...',
                  'Generating result...'
                ].map((msg, idx) => {
                  const isDone = analysisState.stepIndex > idx + 1;
                  const isCurrent = analysisState.stepIndex === idx + 1;

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded border flex items-center gap-2.5 transition ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 animate-pulse'
                          : 'bg-space-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span>{msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Completed Analysis Result (Matches Exact User Specification) */}
          {!analysisState.isProcessing && analysisState.result && (
            <div className="p-6 rounded-2xl bg-space-900/90 backdrop-blur-md border border-rose-500/40 shadow-2xl space-y-6 animate-fade-in font-sans">
              {/* Header Result Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-1 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>SPATIAL RISK ASSESSMENT OUTPUT</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {analysisState.result.zoneName}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    Timestamp: {analysisState.result.timestamp} • Resolution: 0.5m DEM Grid
                  </span>
                </div>

                {/* Score & Badge */}
                <div className="flex items-center gap-4 bg-rose-950/50 border border-rose-500/40 px-4 py-2.5 rounded-xl">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block font-bold">
                      RISK LEVEL
                    </span>
                    <span className="text-xl font-extrabold text-rose-300 font-mono">
                      {analysisState.result.riskLevel}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-rose-800" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      SCORE
                    </span>
                    <span className="text-2xl font-black text-rose-400 font-mono">
                      {analysisState.result.riskScore}<span className="text-sm text-slate-400 font-normal">/100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Factors Breakdown & Radar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Factors List (Exact User Specification) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Contributing Risk Factors
                  </h4>

                  <div className="space-y-2.5">
                    {analysisState.result.factors.map((factor, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-space-950/80 border border-slate-800 flex items-start gap-3"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0 animate-ping" />
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">
                            • {factor.label}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                            {factor.detail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                    <strong className="block font-mono text-[10px] uppercase text-amber-400">
                      Automated Advisory:
                    </strong>
                    {analysisState.result.recommendedAction}
                  </div>
                </div>

                {/* Radar Chart for Risk Dimensions */}
                <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 font-bold">
                    Multi-Dimensional Hazard Spectrum
                  </span>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={analysisState.result.radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={9} />
                        <PolarRadiusAxis stroke="#475569" fontSize={8} domain={[0, 100]} />
                        <Radar name="Observed Hazard" dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                        <Radar name="Baseline Threshold" dataKey="baseline" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.1} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Zone Alpha Vector</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Safety Baseline</span>
                  </div>
                </div>
              </div>

              {/* Crucial Action: View in 3D Digital Twin Button */}
              <div className="pt-2">
                <button
                  onClick={() => viewZoneIn3D(analysisState.result!.zoneId)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-space-950 font-black text-sm shadow-neon-amber flex items-center justify-center gap-2.5 transition"
                >
                  <Box className="w-5 h-5" />
                  <span>View & Highlight Zone Alpha in 3D Digital Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. Default state if analysis hasn't been executed yet */}
          {!analysisState.isProcessing && !analysisState.result && (
            <div className="p-8 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass flex flex-col items-center justify-center min-h-[440px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                Spatial Risk Analysis Engine
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                Select a target zone on the left and click <strong>"Execute Risk Analysis"</strong> to initiate real-time DEM slope calculations, IoT correlation, and predictive hazard scoring.
              </p>
              <button
                onClick={runRiskAnalysisDemo}
                className="mt-6 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs shadow-neon-cyan transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Demo Analysis for Zone Alpha</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
