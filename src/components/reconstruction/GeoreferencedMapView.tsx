import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import { AccuracyReport } from '../../types';

interface GeoreferencedMapViewProps {
  accuracyReport: AccuracyReport;
  hasGps: boolean;
  onProceedToDigitalTwin: () => void;
  onBackToDense: () => void;
}

export const GeoreferencedMapView: React.FC<GeoreferencedMapViewProps> = ({
  accuracyReport,
  hasGps,
  onProceedToDigitalTwin,
  onBackToDense
}) => {
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d');
  const [baseLayer, setBaseLayer] = useState<'satellite' | 'topographic'>('satellite');

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Geospatial Alignment & Orthorectification</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Georeferenced Map & Coordinate Projection
          </h2>
        </div>

        {/* Relative vs Absolute Geographic Accuracy Notice (Section 12) */}
        <div>
          {hasGps ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>CRS: {accuracyReport.crs}</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Relative reconstruction — absolute geographic accuracy unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl bg-space-950 border border-cyan-500/30 overflow-hidden shadow-2xl">
        {/* Simulated GIS Vector / Satellite Surface */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Contour and Road Footprint Vectors */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Reconstructed Boundary Footprint */}
          <polygon
            points="140,80 540,60 620,380 180,410"
            fill="rgba(0, 240, 255, 0.06)"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Drone Single-Pass Flight Trajectory Spline */}
          <path
            d="M 160,280 Q 320,180 580,120"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          {/* Camera Waypoint Stations */}
          {[
            { cx: 160, cy: 280, label: 'WP1' },
            { cx: 230, cy: 245, label: 'WP2' },
            { cx: 310, cy: 215, label: 'WP3' },
            { cx: 400, cy: 180, label: 'WP4' },
            { cx: 490, cy: 150, label: 'WP5' },
            { cx: 580, cy: 120, label: 'WP6' }
          ].map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.cx} cy={pt.cy} r="5" fill="#00f0ff" />
              <circle cx={pt.cx} cy={pt.cy} r="10" fill="none" stroke="#00f0ff" opacity="0.4" />
              <text x={pt.cx + 8} y={pt.cy - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Map Floating HUD Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-space-900/90 backdrop-blur-md border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
          <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flight Footprint: Sector 04</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Center: <strong className="text-cyan-300">{hasGps ? '34°17\'36"N, 77°56\'44"E' : 'Local Origin (0.0, 0.0)'}</strong>
          </div>
          <div className="text-[11px] text-slate-400">
            Survey Area: <strong className="text-emerald-400">142,500 m²</strong>
          </div>
        </div>

        {/* Map Layer Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-lg bg-space-900/90 backdrop-blur-md border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setBaseLayer(baseLayer === 'satellite' ? 'topographic' : 'satellite')}
            className="px-2.5 py-1 rounded bg-space-850 hover:bg-space-800 text-slate-300 text-[11px] transition"
          >
            {baseLayer === 'satellite' ? 'Base: Satellite' : 'Base: Topographic'}
          </button>
          <button
            onClick={() => setMapMode(mapMode === '2d' ? '3d' : '2d')}
            className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[11px] transition"
          >
            {mapMode === '2d' ? '2D Ortho Map' : '3D Relief Mesh'}
          </button>
        </div>

        {/* Scale & Compass (Bottom Right) */}
        <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-space-900/90 backdrop-blur-md border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-12 h-1 bg-white inline-block" />
            <span>50m</span>
          </div>
          <span className="text-cyan-400 font-bold">N ↑</span>
        </div>
      </div>

      {/* Georeferencing Residuals & Quality Breakdown (Section 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Positioning Residuals</span>
          <div className="text-base font-bold text-emerald-400">
            {hasGps ? '±0.42 m GNSS RMSE' : 'Visual Odometry Only'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {hasGps ? 'High confidence spatial locking' : 'Relative local coordinate system'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Ground Sample Distance</span>
          <div className="text-base font-bold text-cyan-300">
            {accuracyReport.groundSampleDistanceCm} cm / pixel
          </div>
          <span className="text-[10px] text-slate-500 block">Single-pass sub-pixel ground resolution</span>
        </div>

        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Control Points</span>
          <div className="text-base font-bold text-white">
            {accuracyReport.gcpAvailability ? `${accuracyReport.gcpCount} Survey GCPs` : 'Direct Video Georeference'}
          </div>
          <span className="text-[10px] text-slate-500 block">WGS 84 Ellipsoidal Transformation</span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDense}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 text-xs font-mono transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dense Model</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDigitalTwin}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan transition"
        >
          <span>Open Final 3D Digital Twin</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GeoreferencedMapView;
