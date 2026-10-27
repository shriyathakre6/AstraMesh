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
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Spatial Compute Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Spatial Analysis Workspace
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Run multi-parametric risk assessments, elevation profiling, and cross-layer spatial inference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 font-bold">
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
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                isSelected
                  ? 'bg-geo-blue-light border-geo-primary text-geo-primary shadow-geo-sm'
                  : 'bg-white border-geo-border text-geo-text-sub hover:text-geo-primary hover:bg-geo-bg'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-geo-primary' : 'text-geo-text-sub'
                }`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-geo-primary animate-ping" />}
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight text-geo-text-main">{tool.name}</span>
                <span className="text-[10px] text-geo-text-sub line-clamp-2 mt-1 hidden sm:block">
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
          <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-geo-border">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-geo-teal" />
                <h3 className="text-sm font-bold text-geo-primary uppercase font-mono tracking-wider">
                  Analysis Parameters
                </h3>
              </div>
              <span className="text-[10px] font-mono text-geo-teal font-semibold">TOOL: RISK ENGINE</span>
            </div>

            {/* Input Selection */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-mono uppercase text-geo-text-sub font-semibold block">
                Target Spatial Zone
              </label>
              <select
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-geo-bg border border-geo-border text-xs text-geo-text-main focus:outline-none focus:border-geo-primary font-mono"
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
              <span className="text-[10px] font-bold text-geo-text-sub uppercase tracking-wider block">
                Fused Layer Inputs (Multi-Spectral)
              </span>
              <div className="p-3 rounded-xl bg-geo-bg border border-geo-border space-y-2 text-[11px] text-geo-text-main">
                <div className="flex items-center justify-between">
                  <span>Cartosat-3 DEM (Slope & Roughness)</span>
                  <span className="text-geo-primary font-bold">Weight: 35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>InSAR Ground Deformation Track</span>
                  <span className="text-geo-primary font-bold">Weight: 25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>IoT Ground Moisture & Temp (AST-04)</span>
                  <span className="text-geo-primary font-bold">Weight: 20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>4K UAV Drone Videogrammetry Recon</span>
                  <span className="text-geo-primary font-bold">Weight: 20%</span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={runRiskAnalysisDemo}
              disabled={analysisState.isProcessing}
              className="w-full py-3 rounded-xl bg-geo-primary hover:bg-geo-primary-hover disabled:opacity-50 text-white font-extrabold text-sm shadow-geo-sm flex items-center justify-center gap-2 transition"
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
          <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm text-xs text-geo-text-sub space-y-2">
            <div className="flex items-center gap-2 text-geo-primary font-bold">
              <Compass className="w-4 h-4 text-geo-teal" />
              <span>SIH Evaluation Note</span>
            </div>
            <p className="leading-relaxed">
              Clicking <strong>"Execute Risk Analysis"</strong> runs our multi-factor spatial hazard pipeline. Once completed, judges can click <strong>"View in 3D"</strong> to automatically fly the camera to the affected risk zone!
            </p>
          </div>
        </div>

        {/* Right Side: Analysis Output & Processing Animation (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {analysisState.isProcessing && (
            <div className="p-8 rounded-2xl bg-white border border-geo-border shadow-geo-md flex flex-col items-center justify-center min-h-[440px] text-center font-mono">
              <div className="w-16 h-16 rounded-full border-4 border-geo-blue-light border-t-geo-primary animate-spin mb-6" />
              
              <h3 className="text-lg font-bold text-geo-primary mb-2">
                Running Autonomous Spatial Inference
              </h3>

              {/* Progress Steps List */}
              <div className="space-y-2 text-xs max-w-sm w-full text-left mt-4">
                {processingMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    {idx < analysisState.stepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : idx === analysisState.stepIndex ? (
                      <div className="w-4 h-4 rounded-full border-2 border-geo-primary border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-geo-border flex-shrink-0" />
                    )}
                    <span className={idx <= analysisState.stepIndex ? 'text-geo-text-main font-semibold' : 'text-geo-text-sub'}>
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Result Card */}
          {!analysisState.isProcessing && analysisState.result && (
            <div className="p-6 rounded-2xl bg-white border border-geo-border shadow-geo-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-geo-border gap-3">
                <div>
                  <span className="text-xs font-mono text-geo-teal uppercase font-bold tracking-wider">
                    Computed Output: {analysisState.result.zoneName}
                  </span>
                  <h3 className="text-xl font-extrabold text-geo-primary">
                    Spatial Hazard & Slope Stability Assessment
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-bold">
                    RISK SCORE: {analysisState.result.riskScore}/100 ({analysisState.result.riskLevel})
                  </div>
                  <button
                    onClick={() => viewZoneIn3D(analysisState.result?.zoneId || 'zone-alpha')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-bold shadow-geo-sm transition"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>View in 3D</span>
                  </button>
                </div>
              </div>

              {/* Result Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-geo-bg border border-geo-border">
                  <span className="text-geo-text-sub text-[10px] uppercase font-bold">Critical Vulnerability Factor</span>
                  <div className="text-base font-bold text-geo-primary mt-1">
                    {analysisState.result.factors[0]?.label || 'Slope Instability'}
                  </div>
                  <span className="text-[10px] text-geo-text-sub">Primary trigger mechanism</span>
                </div>

                <div className="p-3.5 rounded-xl bg-geo-bg border border-geo-border">
                  <span className="text-geo-text-sub text-[10px] uppercase font-bold">Confidence Score</span>
                  <div className="text-base font-bold text-geo-teal mt-1">
                    {analysisState.result.riskScore}% Multi-Spectral
                  </div>
                  <span className="text-[10px] text-geo-text-sub">Validated against InSAR ground track</span>
                </div>

                <div className="p-3.5 rounded-xl bg-geo-bg border border-geo-border">
                  <span className="text-geo-text-sub text-[10px] uppercase font-bold">Recommended Mitigation</span>
                  <div className="text-base font-bold text-geo-primary mt-1">
                    {analysisState.result.recommendedAction}
                  </div>
                  <span className="text-[10px] text-geo-text-sub">Immediate tactical advisory</span>
                </div>
              </div>

              {/* Elevation Profile Curve for Selected Zone */}
              <div className="p-4 rounded-xl bg-geo-bg border border-geo-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-geo-primary uppercase font-mono">
                    Cross-Sectional Topography Profile (Transect A-B)
                  </h4>
                  <span className="text-[10px] font-mono text-geo-text-sub">Max Slope: 44.5° (Critical)</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ELEVATION_PROFILE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#234A72" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#234A72" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E7EF" />
                      <XAxis dataKey="distance" stroke="#667085" fontSize={10} tickLine={false} />
                      <YAxis stroke="#667085" fontSize={10} tickLine={false} domain={[600, 1000]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderColor: '#E1E7EF', 
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#1D2939'
                        }} 
                      />
                      <Area type="monotone" dataKey="elevation" stroke="#234A72" strokeWidth={2} fill="url(#colorElev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Idle Placeholder */}
          {!analysisState.isProcessing && !analysisState.result && (
            <div className="p-12 rounded-2xl bg-white border border-geo-border shadow-geo-sm flex flex-col items-center justify-center min-h-[440px] text-center">
              <div className="w-14 h-14 rounded-2xl bg-geo-blue-light text-geo-primary flex items-center justify-center mb-4">
                <ShieldAlert className="w-7 h-7 text-geo-primary" />
              </div>
              <h3 className="text-base font-bold text-geo-primary">Select Parameters & Run Analysis</h3>
              <p className="text-xs text-geo-text-sub max-w-sm mt-1">
                Choose a spatial sector from the left console and click <strong>"Execute Risk Analysis"</strong> to generate multi-parametric stability charts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
