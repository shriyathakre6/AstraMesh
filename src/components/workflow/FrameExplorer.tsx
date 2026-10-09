import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Sparkles, 
  X, 
  Clock, 
  Activity, 
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import { SampledFrame } from '../../types';

interface FrameExplorerProps {
  frames: SampledFrame[];
  onClose: () => void;
}

export const FrameExplorer: React.FC<FrameExplorerProps> = ({ frames, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'SELECTED' | 'REJECTED'>('ALL');
  const [selectedFrame, setSelectedFrame] = useState<SampledFrame | null>(frames[0] || null);

  const filteredFrames = frames.filter(f => {
    if (filter === 'SELECTED') return f.status === 'selected';
    if (filter === 'REJECTED') return f.status === 'rejected';
    return true;
  });

  const selectedCount = frames.filter(f => f.status === 'selected').length;
  const rejectedCount = frames.filter(f => f.status === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-space-900 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-space-850 to-space-800 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Video Frame Explorer — Intelligent Sampling & Quality Filtering
              </h3>
              <p className="text-xs text-slate-400">
                Single-pass keyframe extraction: {selectedCount} selected, {rejectedCount} rejected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-lg bg-space-950 border border-slate-800 font-mono text-xs">
              {(['ALL', 'SELECTED', 'REJECTED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded transition ${
                    filter === f
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Frame Grid (7 cols) + Right Inspector Detail (5 cols) */}
        <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Scrollable Frames Grid */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>SAMPLED VIDEO FRAMES ({filteredFrames.length})</span>
              <span>CLICK TO INSPECT METRICS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredFrames.map(frame => {
                const isSelected = frame.status === 'selected';
                const isInspected = selectedFrame?.id === frame.id;

                return (
                  <div
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all duration-200 bg-space-950 ${
                      isInspected
                        ? 'border-cyan-400 shadow-neon-cyan'
                        : isSelected
                        ? 'border-emerald-500/30 hover:border-emerald-500'
                        : 'border-rose-500/30 hover:border-rose-500 opacity-75'
                    }`}
                  >
                    {/* Simulated Frame Thumbnail */}
                    <div className="relative w-full h-24 rounded-lg bg-gradient-to-br from-slate-800 via-sky-950 to-slate-900 overflow-hidden flex flex-col justify-between p-1.5 font-mono text-[9px]">
                      <div className="flex items-center justify-between">
                        <span className="bg-space-950/80 px-1 py-0.5 rounded text-white font-bold">
                          #{frame.frameIndex}
                        </span>
                        {isSelected ? (
                          <span className="bg-emerald-500/80 text-space-950 font-black px-1 rounded">
                            KEEP
                          </span>
                        ) : (
                          <span className="bg-rose-500/90 text-white font-black px-1 rounded">
                            REJECT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span>{frame.timestamp}</span>
                        <span className={isSelected ? 'text-emerald-300' : 'text-rose-300'}>
                          Q: {frame.qualityScore}%
                        </span>
                      </div>
                    </div>

                    {/* Frame Rejection Tag */}
                    <div className="mt-1.5 text-[10px] font-mono truncate">
                      {isSelected ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Features: {frame.featuresCount}</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>{frame.rejectionReason}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Frame Inspection Details */}
          {selectedFrame && (
            <div className="md:col-span-5 p-4 rounded-xl bg-space-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Frame #{selectedFrame.frameIndex} Telemetry
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedFrame.status === 'selected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {selectedFrame.status === 'selected' ? 'ACCEPTED FOR 3D SfM' : 'REJECTED'}
                </span>
              </div>

              {/* Large Frame Preview HUD */}
              <div className="relative w-full h-40 rounded-lg bg-gradient-to-br from-sky-950 via-slate-900 to-space-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span className="text-cyan-300 font-bold">TIME: {selectedFrame.timestamp}</span>
                  <span className="text-slate-400">FRAME ID: {selectedFrame.id}</span>
                </div>

                {/* Simulated Feature Keypoints Overlay */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-slate-400 opacity-60">
                    [Keypoint Feature Density Map: {selectedFrame.featuresCount} pts]
                  </span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-400">SHARPNESS: {selectedFrame.sharpness}%</span>
                  <span className="text-amber-300">QUALITY: {selectedFrame.qualityScore}/100</span>
                </div>
              </div>

              {/* Reasons Why Poor Frames Are Rejected (Prompt requirement) */}
              {selectedFrame.status === 'rejected' ? (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1 text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Rejection Cause: {selectedFrame.rejectionReason}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {selectedFrame.rejectionReason === 'Motion blur' && 
                      'Laplacian variance fell below threshold (38/100). High-frequency edge tracking would introduce noisy 3D point cloud outliers.'}
                    {selectedFrame.rejectionReason === 'Too dark' && 
                      'Mean luminance histogram underexposed (< 40 DN). Insufficient contrast for scale-invariant feature extraction.'}
                    {selectedFrame.rejectionReason === 'Too bright' && 
                      'Solar specular reflection saturated camera sensor pixels (> 250 DN), clipping ground texture.'}
                    {selectedFrame.rejectionReason === 'Duplicate' && 
                      'Camera baseline displacement was < 0.2 meters. Discarded to optimize SfM bundle adjustment compute.'}
                    {selectedFrame.rejectionReason === 'Insufficient visual features' && 
                      'Homogeneous water/cloud region. Keypoints (< 500) insufficient to satisfy 8-point epipolar geometry constraint.'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-emerald-200 text-xs">
                  <span className="font-bold block text-emerald-300">✓ Optimal Photogrammetric Keyframe</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Rich gradient variation, clear contrast, and minimal angular blur. Provides stable tie points for triangulation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrameExplorer;
