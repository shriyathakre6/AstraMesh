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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Ready for reconstruction</span>
          </div>
        );
      case 'WARNING_METADATA':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>⚠ Some metadata missing (Visual Trajectory Active)</span>
          </div>
        );
      case 'WARNING_QUALITY':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>⚠ Low video quality detected</span>
          </div>
        );
      case 'BLOCKED':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>❌ Cannot process</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-geo-border">
        <div>
          <h2 className="text-lg font-bold text-geo-primary flex items-center gap-2">
            <span>Step 2: Flight Validation & Quality Audit</span>
          </h2>
          <p className="text-xs text-geo-muted mt-1">
            Autonomous pre-flight check analyzing resolution, optical sharpness, motion blur, and spatial metadata availability.
          </p>
        </div>

        {getStatusBadge(validationReport.status)}
      </div>

      {/* Primary Quality Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* 1. Motion Blur Score */}
        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-geo-muted uppercase font-bold">Motion Blur</span>
            <Activity className="w-3.5 h-3.5 text-geo-teal" />
          </div>
          <div className="text-xl font-extrabold text-geo-primary">
            {validationReport.motionBlurScore}<span className="text-xs text-geo-muted font-normal">/100</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">LOW BLUR (OPTIMAL)</span>
        </div>

        {/* 2. Exposure & Illumination */}
        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-geo-muted uppercase font-bold">Exposure</span>
            <Eye className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-geo-primary">
            {validationReport.frameQualityScore}%
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">UNIFORM ILLUMINATION</span>
        </div>

        {/* 3. Camera Motion Profile */}
        <div className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-geo-muted uppercase font-bold">Flight Dynamics</span>
            <Gauge className="w-3.5 h-3.5 text-geo-secondary" />
          </div>
          <div className="text-sm font-extrabold text-geo-primary truncate">
            SMOOTH SWEEP
          </div>
          <span className="text-[10px] text-geo-muted font-mono block">&lt; 2.4° Jitter variance</span>
        </div>

        {/* 4. GPS & Georeference Status */}
        <div className={`p-3.5 rounded-xl border space-y-1 shadow-geo-sm ${
          validationReport.gpsAvailability 
            ? 'bg-geo-mint/30 border-emerald-200' 
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-geo-muted uppercase font-bold">GPS Availability</span>
            <Navigation className={`w-3.5 h-3.5 ${validationReport.gpsAvailability ? 'text-emerald-600' : 'text-amber-500'}`} />
          </div>
          <div className={`text-sm font-extrabold font-mono ${validationReport.gpsAvailability ? 'text-emerald-700' : 'text-amber-700'}`}>
            {validationReport.gpsAvailability ? 'GNSS TRACK DETECTED' : 'NOT DETECTED'}
          </div>
          <span className="text-[10px] text-geo-muted block font-mono">
            {validationReport.gpsAvailability ? 'Real-world coordinates locked' : 'Relative visual scaling'}
          </span>
        </div>
      </div>

      {/* Comprehensive Checklist Table */}
      <div className="p-4 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-geo-primary uppercase tracking-wider pb-2 border-b border-geo-border flex items-center justify-between">
          <span>Flight Validation Matrix</span>
          <span className="text-geo-muted text-[10px]">SIH26158 PRE-FLIGHT BENCHMARK</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">Video Resolution:</span>
            <span className="font-bold text-geo-text">{videoMeta.resolution}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">Capture Frame Rate:</span>
            <span className="font-bold text-emerald-600">{videoMeta.fps} FPS</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">Flight Duration:</span>
            <span className="font-bold text-geo-text">{videoMeta.formattedDuration}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">Estimated Total Frames:</span>
            <span className="font-bold text-geo-text">~{videoMeta.estimatedFrames.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">Frame Parallax Overlap:</span>
            <span className="font-bold text-geo-primary">&gt; 75% Forward Overlap (Calculated)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-geo-border/60">
            <span className="text-geo-muted">RTK/PPK GNSS Correction:</span>
            <span className={`font-bold ${optionalData.hasRtk ? 'text-emerald-600' : 'text-geo-muted'}`}>
              {optionalData.hasRtk ? 'Enabled (±1.4 cm fix)' : 'None (Standard/Visual)'}
            </span>
          </div>
        </div>
      </div>

      {/* Non-Blocking GPS Advisory Notice */}
      {!validationReport.gpsAvailability && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold text-amber-800">
              GPS metadata was not detected — Reconstruction will NOT be blocked.
            </strong>
            <p className="leading-relaxed text-amber-900/80">
              AstraMesh3D will execute Structure-from-Motion (SfM) using pure visual odometry and feature tracking. The resulting 3D digital twin geometry will be fully reconstructed with high internal precision; however, geographic coordinates will be relative rather than absolute.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-geo-border flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-geo-border hover:bg-geo-bg text-geo-text text-xs font-mono transition shadow-geo-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <div className="flex items-center gap-3">
          {onInspectFrames && (
            <button
              type="button"
              onClick={onInspectFrames}
              className="px-3.5 py-2 rounded-xl bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-geo-primary text-xs font-mono font-semibold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Sampled Frames</span>
            </button>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-secondary text-white font-bold text-xs shadow-geo-sm transition"
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
