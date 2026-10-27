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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-geo-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Compass className="w-4 h-4 text-geo-teal" />
            <span>Geospatial Alignment & Orthorectification</span>
          </div>
          <h2 className="text-lg font-bold text-geo-primary">
            Georeferenced Map & Coordinate Projection
          </h2>
        </div>

        {/* Relative vs Absolute Geographic Accuracy Notice (Section 12) */}
        <div>
          {hasGps ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CRS: {accuracyReport.crs}</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Relative reconstruction — absolute geographic accuracy unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl bg-slate-900 border border-geo-border overflow-hidden shadow-geo-md">
        {/* Simulated GIS Vector / Satellite Surface */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Contour and Road Footprint Vectors */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Reconstructed Boundary Footprint */}
          <polygon
            points="140,80 540,60 620,380 180,410"
            fill="rgba(35, 74, 114, 0.15)"
            stroke="#38bdf8"
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
              <circle cx={pt.cx} cy={pt.cy} r="5" fill="#38bdf8" />
              <circle cx={pt.cx} cy={pt.cy} r="10" fill="none" stroke="#38bdf8" opacity="0.4" />
              <text x={pt.cx + 8} y={pt.cy - 6} fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Map Floating HUD Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-md font-mono text-xs text-geo-text space-y-1.5">
          <div className="text-xs font-bold text-geo-primary uppercase flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-geo-teal" />
            <span>Flight Footprint: Sector 04</span>
          </div>
          <div className="text-[11px] text-geo-muted">
            Center: <strong className="text-geo-primary">{hasGps ? '34°17\'36"N, 77°56\'44"E' : 'Local Origin (0.0, 0.0)'}</strong>
          </div>
          <div className="text-[11px] text-geo-muted">
            Survey Area: <strong className="text-emerald-600">142,500 m²</strong>
          </div>
        </div>

        {/* Map Layer Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-lg bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-md font-mono text-xs">
          <button
            onClick={() => setBaseLayer(baseLayer === 'satellite' ? 'topographic' : 'satellite')}
            className="px-2.5 py-1 rounded bg-geo-bg hover:bg-geo-border text-geo-text text-[11px] transition"
          >
            {baseLayer === 'satellite' ? 'Base: Satellite' : 'Base: Topographic'}
          </button>
          <button
            onClick={() => setMapMode(mapMode === '2d' ? '3d' : '2d')}
            className="px-2.5 py-1 rounded bg-geo-blue-light text-geo-primary font-bold border border-geo-border text-[11px] transition"
          >
            {mapMode === '2d' ? '2D Ortho Map' : '3D Relief Mesh'}
          </button>
        </div>

        {/* Scale & Compass (Bottom Right) */}
        <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-md font-mono text-[10px] text-geo-muted flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-12 h-1 bg-geo-primary inline-block" />
            <span>50m</span>
          </div>
          <span className="text-geo-teal font-bold">N ↑</span>
        </div>
      </div>

      {/* Georeferencing Residuals & Quality Breakdown (Section 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <span className="text-geo-muted text-[10px] uppercase font-bold">Positioning Residuals</span>
          <div className="text-base font-bold text-emerald-600">
            {hasGps ? '±0.42 m GNSS RMSE' : 'Visual Odometry Only'}
          </div>
          <span className="text-[10px] text-geo-muted block">
            {hasGps ? 'High confidence spatial locking' : 'Relative local coordinate system'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <span className="text-geo-muted text-[10px] uppercase font-bold">Ground Sample Distance</span>
          <div className="text-base font-bold text-geo-primary">
            {accuracyReport.groundSampleDistanceCm} cm / pixel
          </div>
          <span className="text-[10px] text-geo-muted block">Single-pass sub-pixel ground resolution</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <span className="text-geo-muted text-[10px] uppercase font-bold">Control Points</span>
          <div className="text-base font-bold text-geo-text">
            {accuracyReport.gcpAvailability ? `${accuracyReport.gcpCount} Survey GCPs` : 'Direct Video Georeference'}
          </div>
          <span className="text-[10px] text-geo-muted block">WGS 84 Ellipsoidal Transformation</span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-geo-border flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDense}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-geo-bg border border-geo-border text-geo-text text-xs font-mono transition shadow-geo-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dense Model</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDigitalTwin}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-secondary text-white font-bold text-xs shadow-geo-sm transition"
        >
          <span>Open Final 3D Digital Twin</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GeoreferencedMapView;
