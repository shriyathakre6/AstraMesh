import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Maximize2, 
  RotateCcw, 
  Sliders, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  Ruler, 
  FileText,
  Eye,
  Camera,
  Navigation,
  Sparkles
} from 'lucide-react';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';
import { ReconstructionJob } from '../../types';

interface Step4Props {
  job: ReconstructionJob;
  onOpenFullViewer: () => void;
  onContinueToAccuracy: () => void;
  onOpenFrameExplorer: () => void;
}

export const Step4ResultViewer: React.FC<Step4Props> = ({
  job,
  onOpenFullViewer,
  onContinueToAccuracy,
  onOpenFrameExplorer
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'3d_model' | 'before_after'>('3d_model');
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50);

  // Model Layer Toggles specified in prompt
  const [modelToggles, setModelToggles] = useState({
    pointCloud: false,
    mesh: true,
    texture: true,
    terrain: true,
    buildings: true,
    roads: true,
    vegetation: true,
    flightTrajectory: true,
    gpsPoints: true
  });

  const toggleLayer = (key: keyof typeof modelToggles) => {
    setModelToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Result Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-geo-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 uppercase tracking-wider mb-0.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>3D RECONSTRUCTION COMPLETE • {job.videoMeta.resolution}</span>
          </div>
          <h2 className="text-lg font-bold text-geo-primary">
            Digital Twin Result: {job.title || 'UAV Flight Sector 04'}
          </h2>
        </div>

        {/* View Mode Switcher: 3D Model vs Before/After */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-geo-bg border border-geo-border font-mono text-xs">
            <button
              onClick={() => setActiveViewMode('3d_model')}
              className={`px-3 py-1 rounded transition ${
                activeViewMode === '3d_model'
                  ? 'bg-white text-geo-primary font-bold border border-geo-border shadow-geo-sm'
                  : 'text-geo-muted hover:text-geo-text'
              }`}
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => setActiveViewMode('before_after')}
              className={`px-3 py-1 rounded transition ${
                activeViewMode === 'before_after'
                  ? 'bg-white text-geo-primary font-bold border border-geo-border shadow-geo-sm'
                  : 'text-geo-muted hover:text-geo-text'
              }`}
            >
              Before / After Drone Video
            </button>
          </div>

          <button
            onClick={onOpenFullViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-geo-primary font-mono text-xs font-bold transition shadow-geo-sm"
            title="Open Full Screen in Page 2 Digital Twin"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Viewer Viewport */}
      <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-geo-border shadow-geo-md bg-slate-900">
        {activeViewMode === '3d_model' ? (
          <DigitalTwinCanvas isMiniPreview={false} />
        ) : (
          /* Before / After Comparison Screen */
          <div className="relative w-full h-full select-none overflow-hidden bg-slate-900">
            {/* Background Layer: 3D Digital Twin Mesh */}
            <div className="absolute inset-0">
              <DigitalTwinCanvas isMiniPreview={false} />
            </div>

            {/* Foreground Clipped Layer: Original Drone Footage Frame */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-geo-primary bg-slate-900 shadow-2xl"
              style={{ width: `${splitSliderPos}%` }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col justify-between p-6 opacity-95">
                <div className="px-3 py-1 rounded bg-black/60 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold w-max">
                  ORIGINAL 4K DRONE RAW FOOTAGE (FRAME #426)
                </div>
                <div className="text-center font-mono text-slate-300 text-xs">
                  Drone Single-Pass Aerial Ortho Perspective (3840x2160 @ 60fps)
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>GPS: 34°17'45.2"N 77°56'48.1"E</span>
                  <span>ALT: 282.5m AGL</span>
                </div>
              </div>
            </div>

            {/* Split Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-geo-primary cursor-ew-resize flex items-center justify-center pointer-events-none"
              style={{ left: `${splitSliderPos}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-geo-primary text-white shadow-geo-md flex items-center justify-center text-[10px] font-bold">
                ⬌
              </div>
            </div>

            {/* Invisible Slider Input */}
            <input
              type="range"
              min="10"
              max="90"
              value={splitSliderPos}
              onChange={(e) => setSplitSliderPos(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>
        )}
      </div>

      {/* Layer Toggles Toolbar (Matches Prompt Controls) */}
      <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-geo-muted uppercase font-bold tracking-wider">
            Reconstructed Layer Filters
          </span>
          <span className="text-geo-muted text-[10px]">Toggle individual geometric elements</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'pointCloud', label: 'Point Cloud' },
            { key: 'mesh', label: '3D Mesh' },
            { key: 'texture', label: 'Texture' },
            { key: 'terrain', label: 'Terrain' },
            { key: 'buildings', label: 'Buildings' },
            { key: 'roads', label: 'Roads' },
            { key: 'vegetation', label: 'Vegetation' },
            { key: 'flightTrajectory', label: 'Flight Trajectory' },
            { key: 'gpsPoints', label: 'GPS Points' }
          ].map(toggle => {
            const isActive = modelToggles[toggle.key as keyof typeof modelToggles];
            return (
              <button
                key={toggle.key}
                type="button"
                onClick={() => toggleLayer(toggle.key as keyof typeof modelToggles)}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  isActive
                    ? 'bg-geo-blue-light text-geo-primary border border-geo-border font-bold shadow-geo-sm'
                    : 'bg-geo-bg text-geo-muted border border-geo-border hover:text-geo-text'
                }`}
              >
                {toggle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-geo-border flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenFrameExplorer}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-geo-bg border border-geo-border text-geo-text text-xs font-mono transition shadow-geo-sm"
        >
          <Camera className="w-3.5 h-3.5 text-geo-teal" />
          <span>Inspect Sampled Frames</span>
        </button>

        <button
          type="button"
          onClick={onContinueToAccuracy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-secondary text-white font-bold text-xs shadow-geo-sm transition"
        >
          <span>Accuracy & Georeferencing Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step4ResultViewer;
