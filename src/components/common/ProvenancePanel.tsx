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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white border border-geo-border shadow-geo-xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 bg-geo-primary text-white border-b border-geo-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-300" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Reconstruction Provenance & Processing Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-geo-blue-light border border-geo-border text-geo-text-main space-y-1">
            <span className="text-[10px] text-geo-primary uppercase font-bold block">
              SIH Scientific Reproducibility Audit
            </span>
            <p className="text-[11px] text-geo-text-sub leading-snug">
              Every stage of the 3D digital twin is traceable to the original drone video and available telemetry sensors.
            </p>
          </div>

          <div className="divide-y divide-geo-border rounded-xl bg-geo-bg border border-geo-border overflow-hidden text-[11px]">
            {provenanceItems.map((item, idx) => (
              <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:bg-geo-blue-light/40 transition">
                <span className="text-geo-text-sub font-medium">{item.label}:</span>
                <span className={`font-bold text-right ${item.highlight ? 'text-geo-primary' : 'text-geo-text-main'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-mono font-bold transition shadow-geo-sm"
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
