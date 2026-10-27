import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  Box, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck,
  Compass
} from 'lucide-react';
import { ReconstructionJob } from '../../types';
import { 
  exportPointCloudPLY, 
  exportCameraPosesCSV, 
  exportFlightPathGeoJSON, 
  exportAuditReportJSON 
} from '../../utils/exporters';

interface ExportModalProps {
  job: ReconstructionJob;
  onClose: () => void;
  onDownloadFeedback: (fileType: string) => void;
}

export const ExportModelModal: React.FC<ExportModalProps> = ({
  job,
  onClose,
  onDownloadFeedback
}) => {
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const exportFormats = [
    {
      id: 'ply',
      name: 'Stanford PLY 3D Point Cloud',
      ext: '.ply',
      size: '1.42 MB ASCII',
      desc: 'Real Stanford PLY file containing 3D vertex coordinates, normals, and RGB photogrammetry attribution.',
      category: 'Point Cloud',
      action: () => exportPointCloudPLY('AstraMesh_Reconstructed_PointCloud.ply')
    },
    {
      id: 'csv_poses',
      name: 'COLMAP Camera Poses (Exterior Orientations)',
      ext: '.csv',
      size: '48 KB',
      desc: 'Real tabular CSV containing frame IDs, timestamps, camera coordinates (X, Y, Z), pitch, roll, yaw, and reprojection errors.',
      category: 'Camera Trajectory',
      action: () => exportCameraPosesCSV('AstraMesh_COLMAP_CameraPoses.csv')
    },
    {
      id: 'geojson_path',
      name: 'Flight Trajectory & Footprint',
      ext: '.geojson',
      size: '18 KB',
      desc: 'Valid OGC GeoJSON FeatureCollection with flight LineString, takeoff/terminus points, and CRS datum properties.',
      category: 'GIS Vector',
      action: () => exportFlightPathGeoJSON('AstraMesh_FlightTrajectory.geojson')
    },
    {
      id: 'json_audit',
      name: 'Reconstruction Audit & Quality Dossier',
      ext: '.json',
      size: '12 KB',
      desc: 'Machine-readable JSON dossier recording video specs, frame sampling stats, and host environment scan.',
      category: 'Audit Report',
      action: () => exportAuditReportJSON({
        job_id: job.id,
        video_metadata: job.videoMeta,
        accuracy_metrics: job.accuracyReport
      }, 'AstraMesh_Audit_Dossier.json')
    }
  ];

  const handleExport = (fmt: typeof exportFormats[0]) => {
    fmt.action();
    setDownloadedItem(fmt.id);
    onDownloadFeedback(`${fmt.name} (${fmt.ext})`);
    setTimeout(() => {
      setDownloadedItem(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-geo-border shadow-geo-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-geo-blue-light border-b border-geo-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-geo-primary" />
            <h3 className="text-sm font-bold text-geo-primary uppercase font-mono tracking-wider">
              Export 3D Photogrammetry & Geospatial Assets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-geo-muted hover:text-geo-text hover:bg-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-geo-mint/40 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Real File Generator:</strong> Downloads generate valid PLY, CSV, GeoJSON, and JSON files directly to your device.
            </span>
          </div>

          <div className="space-y-2.5">
            {exportFormats.map(fmt => (
              <div
                key={fmt.id}
                className="p-3.5 rounded-xl bg-white border border-geo-border shadow-geo-sm hover:border-geo-primary/50 flex items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-geo-bg border border-geo-border text-geo-primary mt-0.5">
                    {fmt.category === 'Point Cloud' ? (
                      <Layers className="w-4 h-4" />
                    ) : fmt.category === 'Camera Trajectory' ? (
                      <Compass className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-geo-text font-mono">{fmt.name}</span>
                      <span className="text-[10px] font-mono text-geo-muted">{fmt.size}</span>
                    </div>
                    <p className="text-[11px] text-geo-muted mt-0.5 leading-snug">
                      {fmt.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExport(fmt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition flex-shrink-0 ${
                    downloadedItem === fmt.id
                      ? 'bg-emerald-600 text-white shadow-geo-sm'
                      : 'bg-geo-blue-light hover:bg-geo-blue-light/80 text-geo-primary border border-geo-border'
                  }`}
                >
                  {downloadedItem === fmt.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white hover:bg-geo-bg border border-geo-border text-geo-text text-xs font-mono transition shadow-geo-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModelModal;
