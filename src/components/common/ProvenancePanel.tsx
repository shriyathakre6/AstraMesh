import React from 'react';
import { 
  FileText, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  Compass, 
  Camera, 
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ReconstructionJob } from '../../types';

interface ProvenancePanelProps {
  job: ReconstructionJob;
  onClose: () => void;
}

export const ProvenancePanel: React.FC<ProvenancePanelProps> = ({ job, onClose }) => {
  const provenanceItems = [
    { label: 'Input Video', value: job.videoMeta.fileName, highlight: true },
    { label: 'Video Resolution & FPS', value: `${job.videoMeta.resolution} @ ${job.videoMeta.fps} fps` },
    { label: 'Total Ingested Frames', value: `~${job.videoMeta.estimatedFrames.toLocaleString()} frames` },
    { label: 'Sampled / Selected Keyframes', value: `${job.sampledFrames.filter(f => f.status === 'selected').length} Frames Selected (${job.sampledFrames.length} Sampled)` },
    { label: 'Camera Model Assumption', value: 'OPENCV Radial-Tangential (Single-Pass Nadir/Oblique)' },
    { label: 'Feature Extraction Algorithm', value: 'Sub-Pixel Harris Corner & Scale-Invariant SIFT' },
    { label: 'Feature Matching Method', value: 'Sequential Epipolar Matching with RANSAC inlier rejection' },
    { label: 'COLMAP Status', value: 'Simulation Adapter (COLMAP binary not found on host PATH)' },
    { label: 'Depth Estimation Method', value: 'Perspective Gradient Disparity + Monocular Depth Prior' },
    { label: 'GPS Telemetry Status', value: job.optionalData.hasGps ? 'GNSS Track Synchronized' : 'Not Detected (Relative Coordinate Frame)' },
    { label: 'IMU Telemetry Status', value: job.optionalData.hasImu ? '9-DOF Orientation Linked' : 'Estimated from Optical Flow' },
    { label: 'RTK / PPK Status', value: job.optionalData.hasRtk ? 'RTK Fixed Base Differential' : 'None (Visual Scale)' },
    { label: 'GCP Availability', value: job.optionalData.hasGcp ? 'GCP Reference Array Attached' : 'No GCP provided' },
    { label: 'Georeferencing Method', value: job.optionalData.hasGps ? '7-Parameter Helmert Similarity Transform to EPSG:4326' : 'Local Arbitrary Origin' },
    { label: 'Surface Mesh Method', value: 'Delaunay Grid Surface Triangulation' },
    { label: 'Texture Source', value: 'Direct Unprojected Imagery from Uploaded Drone Video Frames' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-space-900 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-space-850 to-space-800 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Reconstruction Provenance & Processing Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800 text-slate-300 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">
              SIH Scientific Reproducibility Audit
            </span>
            <p className="text-[11px] text-slate-400 leading-snug">
              Every stage of the 3D digital twin is traceable to the original drone video and available telemetry sensors.
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-xl bg-space-950 border border-slate-800 overflow-hidden text-[11px]">
            {provenanceItems.map((item, idx) => (
              <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:bg-space-900/60 transition">
                <span className="text-slate-400 font-medium">{item.label}:</span>
                <span className={`font-bold text-right ${item.highlight ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono transition"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvenancePanel;
