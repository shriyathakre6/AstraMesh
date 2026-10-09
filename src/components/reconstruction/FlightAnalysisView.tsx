import React, { useRef, useState } from 'react';
import { 
  Video, 
  FileText, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause, 
  Info,
  Clock,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { FlightVideoMetadata, OptionalFlightData } from '../../types';

interface FlightAnalysisViewProps {
  videoMeta: FlightVideoMetadata;
  optionalData: OptionalFlightData;
  videoSrc?: string;
  onProceedToSampling: () => void;
  onBackToUpload: () => void;
}

export const FlightAnalysisView: React.FC<FlightAnalysisViewProps> = ({
  videoMeta,
  optionalData,
  videoSrc,
  onProceedToSampling,
  onBackToUpload
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const hasGps = optionalData.hasGps;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>Single-Pass Video Ingestion & Flight Analysis</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Flight Telemetry & Video Characteristics
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasGps ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS Telemetry Linked</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Visual Odometry (Relative Coordinates)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Ingestion Grid: Left Video Player (7 cols) + Right Telemetry Table (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Video Player / Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full aspect-video rounded-2xl bg-space-950 border border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center group">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              /* Simulated Aerial Video Player Canvas */
              <div className="w-full h-full bg-gradient-to-br from-sky-950 via-slate-900 to-space-950 flex flex-col items-center justify-center p-6 text-center select-none">
                <Video className="w-12 h-12 text-cyan-400 mb-2 opacity-80" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {videoMeta.fileName}
                </span>
                <span className="text-[11px] font-mono text-cyan-300 mt-1">
                  Single-Pass Aerial Sweep • {videoMeta.resolution}
                </span>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-space-950/30 opacity-0 group-hover:opacity-100 transition flex items-end p-4">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-space-900/90 hover:bg-cyan-500 text-white hover:text-space-950 transition flex items-center gap-2 text-xs font-mono font-bold shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Footage'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>INPUT STREAM: {videoMeta.format}</span>
            <span>SINGLE FLIGHT PATH: 1 PASS</span>
          </div>
        </div>

        {/* Right: Detected Video Properties & Metadata Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Video Specifications
              </span>
              <span className="text-cyan-400 font-bold text-[10px]">
                PASS 1 OF 1
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">File Name:</span>
                <span className="text-white font-bold max-w-[200px] truncate">{videoMeta.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">File Size:</span>
                <span className="text-white font-bold">{videoMeta.fileSizeMb} MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Duration:</span>
                <span className="text-cyan-300 font-bold">{videoMeta.formattedDuration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Resolution:</span>
                <span className="text-emerald-400 font-bold">{videoMeta.resolution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Aspect Ratio:</span>
                <span className="text-white font-bold">16:9 Landscape</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Framerate (FPS):</span>
                <span className="text-white font-bold">{videoMeta.fps} fps</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Estimated Total Frames:</span>
                <span className="text-cyan-300 font-bold">~{videoMeta.estimatedFrames.toLocaleString()} frames</span>
              </div>
            </div>
          </div>

          {/* Explicit GPS Detection Notice (Required by Section 2: Do NOT fabricate GPS) */}
          <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${
            hasGps 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {hasGps ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GPS / GNSS Telemetry Detected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>GPS Metadata Not Detected</span>
                </>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
              {hasGps ? (
                'Synchronized GNSS flight coordinates detected. 3D model will be georeferenced to real Earth coordinates.'
              ) : (
                'Video does not contain embedded GPS coordinates or flight logs. Reconstruction will continue normally using relative Structure-from-Motion visual tracking. Absolute geographic accuracy will be unavailable.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToUpload}
          className="px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 text-xs font-mono transition"
        >
          Change Video File
        </button>

        <button
          type="button"
          onClick={onProceedToSampling}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan transition"
        >
          <span>Extract & Sample Keyframes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FlightAnalysisView;
