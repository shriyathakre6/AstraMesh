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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3D RECONSTRUCTION COMPLETE • {job.videoMeta.resolution}</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Digital Twin Result: {job.title || 'UAV Flight Sector 04'}
          </h2>
        </div>

        {/* View Mode Switcher: 3D Model vs Before/After */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-space-900 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveViewMode('3d_model')}
              className={`px-3 py-1 rounded transition ${
                activeViewMode === '3d_model'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => setActiveViewMode('before_after')}
              className={`px-3 py-1 rounded transition ${
                activeViewMode === 'before_after'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Before / After Drone Video
            </button>
          </div>

          <button
            onClick={onOpenFullViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition"
            title="Open Full Screen in Page 2 Digital Twin"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Viewer Viewport */}
      <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-space-950">
        {activeViewMode === '3d_model' ? (
          <DigitalTwinCanvas isMiniPreview={false} />
        ) : (
          /* Before / After Comparison Screen */
          <div className="relative w-full h-full select-none overflow-hidden bg-space-950">
            {/* Background Layer: 3D Digital Twin Mesh */}
            <div className="absolute inset-0">
              <DigitalTwinCanvas isMiniPreview={false} />
            </div>

            {/* Foreground Clipped Layer: Original Drone Footage Frame */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 bg-space-900 shadow-2xl"
              style={{ width: `${splitSliderPos}%` }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-sky-900 via-slate-900 to-space-950 flex flex-col justify-between p-6 opacity-95">
                <div className="px-3 py-1 rounded bg-space-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold w-max">
                  ORIGINAL 4K DRONE RAW FOOTAGE (FRAME #426)
                </div>
                <div className="text-center font-mono text-slate-400 text-xs">
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
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize flex items-center justify-center pointer-events-none"
              style={{ left: `${splitSliderPos}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-cyan-400 text-space-950 shadow-neon-cyan flex items-center justify-center text-[10px] font-bold">
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
      <div className="p-3 rounded-xl bg-space-900 border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Reconstructed Layer Filters
          </span>
          <span className="text-slate-500 text-[10px]">Toggle individual geometric elements</span>
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
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-space-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {toggle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenFrameExplorer}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-slate-300 text-xs font-mono transition"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inspect Sampled Frames</span>
        </button>

        <button
          type="button"
          onClick={onContinueToAccuracy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan transition"
        >
          <span>Accuracy & Georeferencing Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step4ResultViewer;
