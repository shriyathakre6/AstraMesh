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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-geo-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Video className="w-4 h-4 text-geo-teal" />
            <span>Single-Pass Video Ingestion & Flight Analysis</span>
          </div>
          <h2 className="text-lg font-bold text-geo-primary">
            Flight Telemetry & Video Characteristics
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasGps ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS Telemetry Linked</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Visual Odometry (Relative Coordinates)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Ingestion Grid: Left Video Player (7 cols) + Right Telemetry Table (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Video Player / Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full aspect-video rounded-2xl bg-slate-900 border border-geo-border overflow-hidden shadow-geo-md flex items-center justify-center group">
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
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
                <Video className="w-12 h-12 text-geo-teal mb-2 opacity-80" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {videoMeta.fileName}
                </span>
                <span className="text-[11px] font-mono text-cyan-300 mt-1">
                  Single-Pass Aerial Sweep • {videoMeta.resolution}
                </span>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-white hover:bg-geo-bg text-geo-primary transition flex items-center gap-2 text-xs font-mono font-bold shadow-geo-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Footage'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-geo-muted px-1">
            <span>INPUT STREAM: {videoMeta.format}</span>
            <span>SINGLE FLIGHT PATH: 1 PASS</span>
          </div>
        </div>

        {/* Right: Detected Video Properties & Metadata Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-geo-border">
              <span className="text-[10px] text-geo-muted uppercase font-bold tracking-wider">
                Video Specifications
              </span>
              <span className="text-geo-primary font-bold text-[10px]">
                PASS 1 OF 1
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">File Name:</span>
                <span className="text-geo-text font-bold max-w-[200px] truncate">{videoMeta.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">File Size:</span>
                <span className="text-geo-text font-bold">{videoMeta.fileSizeMb} MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">Duration:</span>
                <span className="text-geo-primary font-bold">{videoMeta.formattedDuration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">Resolution:</span>
                <span className="text-emerald-600 font-bold">{videoMeta.resolution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">Aspect Ratio:</span>
                <span className="text-geo-text font-bold">16:9 Landscape</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">Framerate (FPS):</span>
                <span className="text-geo-text font-bold">{videoMeta.fps} fps</span>
              </div>
              <div className="flex justify-between py-1 border-b border-geo-border/60">
                <span className="text-geo-muted">Estimated Total Frames:</span>
                <span className="text-geo-secondary font-bold">~{videoMeta.estimatedFrames.toLocaleString()} frames</span>
              </div>
            </div>
          </div>

          {/* Explicit GPS Detection Notice (Required by Section 2: Do NOT fabricate GPS) */}
          <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${
            hasGps 
              ? 'bg-geo-mint/40 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {hasGps ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>GPS / GNSS Telemetry Detected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>GPS Metadata Not Detected</span>
                </>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-geo-text font-sans">
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
      <div className="pt-4 border-t border-geo-border flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToUpload}
          className="px-4 py-2 rounded-xl bg-white hover:bg-geo-bg border border-geo-border text-geo-text text-xs font-mono transition shadow-geo-sm"
        >
          Change Video File
        </button>

        <button
          type="button"
          onClick={onProceedToSampling}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-secondary text-white font-bold text-xs shadow-geo-sm transition"
        >
          <span>Extract & Sample Keyframes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FlightAnalysisView;
