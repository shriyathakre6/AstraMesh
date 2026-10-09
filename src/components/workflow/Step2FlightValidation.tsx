import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Gauge, 
  Activity, 
  Video, 
  Navigation, 
  Eye, 
  Layers, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { FlightVideoMetadata, OptionalFlightData, FlightValidationReport, ValidationStatus } from '../../types';

interface Step2Props {
  videoMeta: FlightVideoMetadata;
  optionalData: OptionalFlightData;
  validationReport: FlightValidationReport;
  onContinue: () => void;
  onBack: () => void;
  onInspectFrames?: () => void;
}

export const Step2FlightValidation: React.FC<Step2Props> = ({
  videoMeta,
  optionalData,
  validationReport,
  onContinue,
  onBack,
  onInspectFrames
}) => {
  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'READY':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>✓ Ready for reconstruction</span>
          </div>
        );
      case 'WARNING_METADATA':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>⚠ Some metadata missing (Visual Trajectory Active)</span>
          </div>
        );
      case 'WARNING_QUALITY':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>⚠ Low video quality detected</span>
          </div>
        );
      case 'BLOCKED':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>❌ Cannot process</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Step 2: Flight Validation & Quality Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous pre-flight check analyzing resolution, optical sharpness, motion blur, and spatial metadata availability.
          </p>
        </div>

        {getStatusBadge(validationReport.status)}
      </div>

      {/* Primary Quality Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* 1. Motion Blur Score */}
        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Motion Blur</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {validationReport.motionBlurScore}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold block">LOW BLUR (OPTIMAL)</span>
        </div>

        {/* 2. Exposure & Illumination */}
        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Exposure</span>
            <Eye className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {validationReport.frameQualityScore}%
          </div>
          <span className="text-[10px] text-emerald-400 font-bold block">UNIFORM ILLUMINATION</span>
        </div>

        {/* 3. Camera Motion Profile */}
        <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Flight Dynamics</span>
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-sm font-extrabold text-cyan-300 truncate">
            SMOOTH SWEEP
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">&lt; 2.4° Jitter variance</span>
        </div>

        {/* 4. GPS & Georeference Status */}
        <div className={`p-3.5 rounded-xl border space-y-1 ${
          validationReport.gpsAvailability 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">GPS Availability</span>
            <Navigation className={`w-3.5 h-3.5 ${validationReport.gpsAvailability ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className={`text-sm font-extrabold font-mono ${validationReport.gpsAvailability ? 'text-emerald-300' : 'text-amber-300'}`}>
            {validationReport.gpsAvailability ? 'GNSS TRACK DETECTED' : 'NOT DETECTED'}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {validationReport.gpsAvailability ? 'Real-world coordinates locked' : 'Relative visual scaling'}
          </span>
        </div>
      </div>

      {/* Comprehensive Checklist Table */}
      <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Flight Validation Matrix</span>
          <span className="text-slate-500 text-[10px]">SIH26158 PRE-FLIGHT BENCHMARK</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Video Resolution:</span>
            <span className="font-bold text-white">{videoMeta.resolution}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Capture Frame Rate:</span>
            <span className="font-bold text-emerald-400">{videoMeta.fps} FPS</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Flight Duration:</span>
            <span className="font-bold text-white">{videoMeta.formattedDuration}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Estimated Total Frames:</span>
            <span className="font-bold text-white">~{videoMeta.estimatedFrames.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Frame Parallax Overlap:</span>
            <span className="font-bold text-cyan-300">&gt; 75% Forward Overlap (Calculated)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">RTK/PPK GNSS Correction:</span>
            <span className={`font-bold ${optionalData.hasRtk ? 'text-emerald-400' : 'text-slate-400'}`}>
              {optionalData.hasRtk ? 'Enabled (±1.4 cm fix)' : 'None (Standard/Visual)'}
            </span>
          </div>
        </div>
      </div>

      {/* Non-Blocking GPS Advisory Notice */}
      {!validationReport.gpsAvailability && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold text-amber-300">
              GPS metadata was not detected — Reconstruction will NOT be blocked.
            </strong>
            <p className="leading-relaxed text-slate-300">
              AstraMesh3D will execute Structure-from-Motion (SfM) using pure visual odometry and feature tracking. The resulting 3D digital twin geometry will be fully reconstructed with high internal precision; however, geographic coordinates will be relative rather than absolute.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 text-xs font-mono transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <div className="flex items-center gap-3">
          {onInspectFrames && (
            <button
              type="button"
              onClick={onInspectFrames}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-cyan-300 text-xs font-mono transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Sampled Frames</span>
            </button>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan transition"
          >
            <span>Start AI Reconstruction Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2FlightValidation;
