import React from 'react';
import { 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  Layers, 
  FileText, 
  ArrowLeft,
  Share2,
  Box
} from 'lucide-react';
import { AccuracyReport, ReconstructionJob } from '../../types';

interface Step5Props {
  job: ReconstructionJob;
  report: AccuracyReport;
  onBackToModel: () => void;
  onOpenExportModal: () => void;
  onCloseWorkflow: () => void;
}

export const Step5AccuracyReport: React.FC<Step5Props> = ({
  job,
  report,
  onBackToModel,
  onOpenExportModal,
  onCloseWorkflow
}) => {
  const getConfidenceBadge = (confidence: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            HIGH CONFIDENCE
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            MEDIUM CONFIDENCE
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            LOW CONFIDENCE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Geospatial Verification & Georeferencing Ledger</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Accuracy & Georeferencing Report
          </h2>
        </div>

        {/* Prototype Transparency Notice */}
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
          Prototype / Simulation Benchmark
        </span>
      </div>

      {/* 3 Core Quality Confidence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Estimated Positioning Quality */}
        <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Positioning Quality</span>
            {getConfidenceBadge(report.positioningConfidence)}
          </div>
          <div className="text-base font-bold text-white font-mono">
            {report.rtkPpkStatus}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {report.gpsAvailability 
              ? 'Absolute georeferenced alignment tied to GNSS coordinate frame.' 
              : 'Relative visual odometry scaling (GPS not detected).'}
          </p>
        </div>

        {/* Card 2: Reconstruction Quality */}
        <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reconstruction Quality</span>
            {getConfidenceBadge(report.reconstructionConfidence)}
          </div>
          <div className="text-base font-bold text-cyan-300 font-mono">
            {report.groundSampleDistanceCm} cm GSD / Pixel
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Single-pass parallax baseline provides high triangular mesh density.
          </p>
        </div>

        {/* Card 3: Camera Trajectory Quality */}
        <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Trajectory Quality</span>
            {getConfidenceBadge(report.cameraTrajectoryConfidence)}
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {report.reprojectionErrorPx} px Mean RMSE
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Bundle adjustment residuals within sub-pixel convergence limit (&lt; 1.0 px).
          </p>
        </div>
      </div>

      {/* Detailed Technical Parameters Matrix */}
      <div className="p-5 rounded-xl bg-space-950/80 border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Spatial Precision Matrix</span>
          <span className="text-slate-500 text-[10px]">CRS: {report.crs}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Coordinate Reference System:</span>
            <span className="font-bold text-cyan-300">{report.crs}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">GPS Track Status:</span>
            <span className={`font-bold ${report.gpsAvailability ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.gpsAvailability ? 'Available (10 Hz GNSS)' : 'Visual Estimate Only'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">RTK / PPK Status:</span>
            <span className="font-bold text-emerald-400">{report.rtkPpkStatus}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Ground Control Points (GCP):</span>
            <span className="font-bold text-slate-200">
              {report.gcpAvailability ? `${report.gcpCount} Surveyed GCPs Active` : '0 (Direct Georeferencing)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Dense Point Cloud Total:</span>
            <span className="font-bold text-white">{report.densePointsCount.toLocaleString()} points</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Reconstructed Mesh Faces:</span>
            <span className="font-bold text-white">{report.meshFacesCount.toLocaleString()} triangles</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToModel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 text-xs font-mono transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to 3D Model</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-space-950 font-bold text-xs shadow-neon-cyan transition"
          >
            <Download className="w-4 h-4" />
            <span>Export 3D Model & Reports</span>
          </button>

          <button
            type="button"
            onClick={onCloseWorkflow}
            className="px-4 py-2.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono transition"
          >
            Finish & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step5AccuracyReport;
