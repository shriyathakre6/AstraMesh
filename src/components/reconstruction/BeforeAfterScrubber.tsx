import React, { useState } from 'react';
import { 
  Video, 
  Box, 
  Play, 
  Pause, 
  Sliders, 
  Maximize2, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';

interface BeforeAfterScrubberProps {
  videoName: string;
}

export const BeforeAfterScrubber: React.FC<BeforeAfterScrubberProps> = ({ videoName }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // Split %
  const [timelineSec, setTimelineSec] = useState<number>(14.2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-geo-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-0.5 font-semibold">
            <Sparkles className="w-4 h-4 text-geo-teal" />
            <span>SIH26158 Visual Verification Engine</span>
          </div>
          <h2 className="text-lg font-bold text-geo-primary">
            Before → After: Drone Video vs 3D Digital Reality
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-geo-muted">
          <span>TIMECODE: 00:{Math.floor(timelineSec).toString().padStart(2, '0')}.40</span>
          <span>|</span>
          <span className="text-geo-primary font-bold">SPLIT: {sliderPosition}%</span>
        </div>
      </div>

      {/* Main Split-Screen Viewport */}
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-geo-border bg-slate-900 shadow-geo-md select-none">
        {/* Right Side: Reconstructed 3D Digital Twin */}
        <div className="absolute inset-0">
          <DigitalTwinCanvas isMiniPreview={false} />
          {/* Label Badge on Right Side */}
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-sky-400/40 text-cyan-300 font-mono text-xs font-bold shadow-geo-sm">
            AFTER: 3D DIGITAL TWIN MESH
          </div>
        </div>

        {/* Left Side (Clipped): Original 4K Drone Footage Frame */}
        <div 
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-geo-primary bg-slate-900 shadow-2xl z-10"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col justify-between p-6">
            <div className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-300 font-mono text-xs font-bold w-max shadow-geo-sm">
              BEFORE: ORIGINAL 4K DRONE FOOTAGE
            </div>

            <div className="text-center font-mono space-y-1">
              <div className="w-12 h-12 rounded-xl bg-geo-primary/30 border border-geo-border text-white flex items-center justify-center mx-auto mb-2">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-white text-sm font-bold block">{videoName}</span>
              <span className="text-slate-300 text-xs block">Frame #{Math.round(timelineSec * 30)} • 3840x2160 @ 60fps</span>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-300 bg-black/60 p-2.5 rounded-lg border border-slate-700">
              <span>CAMERA: NADIR-OBLIQUE 45°</span>
              <span>ALTITUDE: 285m AGL</span>
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-geo-primary cursor-ew-resize flex items-center justify-center pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-geo-primary text-white shadow-geo-md flex items-center justify-center text-xs font-black">
            ⬌
          </div>
        </div>

        {/* Range Input for Split Handle */}
        <input
          type="range"
          min="5"
          max="95"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          title="Drag to compare Original Video with 3D Reconstructed Model"
        />
      </div>

      {/* Video Timeline Scrubbing Bar (Section 15: Scrub through video) */}
      <div className="p-4 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-geo-muted font-semibold">
          <span className="flex items-center gap-1.5 text-geo-primary font-bold">
            <Video className="w-3.5 h-3.5 text-geo-teal" />
            <span>Synchronized Flight Timeline Scrubber</span>
          </span>
          <span>00:00.00 ──────── 00:28.50</span>
        </div>

        <input
          type="range"
          min="0"
          max="28.5"
          step="0.1"
          value={timelineSec}
          onChange={(e) => setTimelineSec(parseFloat(e.target.value))}
          className="w-full accent-geo-primary cursor-pointer h-1.5 bg-geo-bg rounded-lg border border-geo-border"
        />

        <div className="flex items-center justify-between text-[10px] text-geo-muted pt-1">
          <span>Flight Ingress (Takeoff)</span>
          <span>Mid-Flight Survey Sweep</span>
          <span>Flight Egress (Terminus)</span>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterScrubber;
