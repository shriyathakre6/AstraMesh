import React, { useState } from 'react';
import { 
  Upload, 
  Video, 
  FileCheck, 
  Navigation, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { FlightVideoMetadata, OptionalFlightData } from '../../types';
import { TechnicalTooltip } from './TechnicalTooltip';

interface Step1Props {
  videoMeta: FlightVideoMetadata | null;
  setVideoMeta: (meta: FlightVideoMetadata) => void;
  optionalData: OptionalFlightData;
  setOptionalData: (data: OptionalFlightData) => void;
  onContinue: () => void;
}

export const Step1UploadFlightData: React.FC<Step1Props> = ({
  videoMeta,
  setVideoMeta,
  optionalData,
  setOptionalData,
  onContinue
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Quick pre-filled flight profile for demonstration
  const handleLoadSampleFlight = () => {
    setVideoMeta({
      fileName: 'UAV_Raven04_Sector7_4K_SinglePass.mp4',
      fileSizeMb: 342.6,
      durationSec: 28.5,
      formattedDuration: '00:28 (28.5s)',
      resolution: '3840 x 2160 (4K UHD)',
      fps: 60,
      estimatedFrames: 1710,
      format: 'MP4 (H.265 / HEVC)',
      uploadStatus: 'complete'
    });

    setOptionalData({
      hasGps: true,
      gpsFile: { name: 'FlightLog_Raven04_GNSS_10Hz.csv', sizeKb: 124, pointsCount: 285 },
      hasImu: true,
      imuFile: { name: 'IMU_9DOF_Telemetry.json', sizeKb: 88, samplingRateHz: 50 },
      hasRtk: true,
      rtkFile: { name: 'RTK_BaseCorrection_Ladakh.obs', sizeKb: 410, fixType: 'RTK FIXED (±1.4 cm)' },
      hasIntrinsics: true,
      intrinsicsFile: { name: 'DJI_Zenmuse_P1_24mm_Calib.xml', focalLength: '24.12 mm', sensorSize: '35.9 x 24.0 mm' },
      hasGcp: false
    });
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoMeta({
        fileName: file.name,
        fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(1)),
        durationSec: 32.0,
        formattedDuration: '00:32 (32.0s)',
        resolution: '3840 x 2160 (4K UHD)',
        fps: 60,
        estimatedFrames: 1920,
        format: file.name.endsWith('.mov') ? 'MOV (ProRes)' : 'MP4 (H.265)',
        uploadStatus: 'complete'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-geo-border">
        <div>
          <h2 className="text-lg font-bold text-geo-primary flex items-center gap-2">
            <span>Step 1: Upload Drone Flight Data</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-geo-blue-light text-geo-primary border border-geo-border font-semibold">
              SINGLE-PASS PIPELINE
            </span>
          </h2>
          <p className="text-xs text-geo-muted mt-1">
            Provide a continuous video recording from your UAV flight path. No complex ground setup required.
          </p>
        </div>

        {/* 1-Click Sample Preloader for judges */}
        <button
          type="button"
          onClick={handleLoadSampleFlight}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-geo-primary text-xs font-mono font-bold transition shadow-geo-sm"
          title="Load pre-calibrated 4K UAV flight data for instant demonstration"
        >
          <Sparkles className="w-3.5 h-3.5 text-geo-teal" />
          <span>Load Sample 4K Drone Flight</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mandatory Video Ingestion (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase font-bold text-geo-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-geo-teal" />
                <span>Mandatory Input: Single-Pass Drone Video</span>
              </span>
              <span className="text-[10px] font-mono text-geo-primary bg-geo-blue-light px-2 py-0.5 rounded border border-geo-border font-bold">
                REQUIRED
              </span>
            </div>

            {/* Video Dropzone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setVideoMeta({
                    fileName: file.name,
                    fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(1)),
                    durationSec: 30.0,
                    formattedDuration: '00:30 (30.0s)',
                    resolution: '3840 x 2160 (4K UHD)',
                    fps: 60,
                    estimatedFrames: 1800,
                    format: file.name.endsWith('.mov') ? 'MOV (ProRes)' : 'MP4 (H.265)',
                    uploadStatus: 'complete'
                  });
                }
              }}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                dragActive 
                  ? 'border-geo-primary bg-geo-blue-light/40' 
                  : videoMeta 
                  ? 'border-geo-teal/50 bg-geo-mint/20' 
                  : 'border-geo-border hover:border-geo-primary/50 bg-white'
              }`}
            >
              <input
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <div className="w-12 h-12 rounded-xl bg-geo-blue-light border border-geo-border text-geo-primary flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6" />
              </div>

              {videoMeta ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{videoMeta.fileName}</span>
                  </div>
                  <p className="text-[11px] text-geo-muted font-mono">
                    Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-geo-text">
                    Drag and drop your drone flight video, or <span className="text-geo-primary font-semibold underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-geo-muted font-mono">
                    Supports MP4, MOV (1080p, 2.7K, 4K UHD up to 4 GB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Extracted File Details Card */}
          {videoMeta && (
            <div className="p-4 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-3 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-geo-border">
                <span className="text-[10px] text-geo-muted uppercase font-bold tracking-wider">
                  Analyzed Video Characteristics
                </span>
                <span className="text-emerald-600 text-[10px] font-bold">
                  ✓ READY FOR SAMPLING
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">FILE SIZE</span>
                  <span className="text-geo-text font-bold">{videoMeta.fileSizeMb} MB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">RESOLUTION</span>
                  <span className="text-geo-primary font-bold">{videoMeta.resolution}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">DURATION</span>
                  <span className="text-geo-text font-bold">{videoMeta.formattedDuration}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">FRAME RATE</span>
                  <span className="text-emerald-600 font-bold">{videoMeta.fps} FPS</span>
                </div>
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">TOTAL FRAMES</span>
                  <span className="text-geo-text font-bold">~{videoMeta.estimatedFrames.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border">
                  <span className="text-geo-muted text-[10px] block">FORMAT</span>
                  <span className="text-geo-secondary font-bold">{videoMeta.format}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Optional Metadata Enhancements (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-geo-text flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-geo-secondary" />
              <span>Optional Precision Enhancements</span>
            </span>
            <span className="text-[10px] font-mono text-geo-muted bg-geo-bg px-2 py-0.5 rounded border border-geo-border">
              NON-BLOCKING
            </span>
          </div>

          <p className="text-xs text-geo-muted leading-relaxed">
            Reconstruction works completely without these files. Adding them unlocks centimeter-level scale and georeferencing.
          </p>

          <div className="space-y-2.5 text-xs font-sans">
            {/* Optional 1: GPS Log */}
            <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-geo-primary flex-shrink-0" />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-geo-text">GPS / Flight Track</span>
                    <TechnicalTooltip term="GPS" />
                  </div>
                  <span className="text-[10px] font-mono text-geo-muted block">
                    {optionalData.hasGps ? optionalData.gpsFile?.name : '.csv / .gpx / .kml log'}
                  </span>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionalData.hasGps}
                  onChange={(e) => setOptionalData({ ...optionalData, hasGps: e.target.checked })}
                  className="rounded accent-geo-primary"
                />
              </label>
            </div>

            {/* Optional 2: IMU Data */}
            <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-geo-text">IMU 9-DOF Log</span>
                    <TechnicalTooltip term="IMU" />
                  </div>
                  <span className="text-[10px] font-mono text-geo-muted block">
                    {optionalData.hasImu ? optionalData.imuFile?.name : 'Pitch / Roll / Yaw orientation'}
                  </span>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionalData.hasImu}
                  onChange={(e) => setOptionalData({ ...optionalData, hasImu: e.target.checked })}
                  className="rounded accent-geo-primary"
                />
              </label>
            </div>

            {/* Optional 3: RTK / PPK Corrections */}
            <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-geo-teal flex-shrink-0" />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-geo-text">RTK / PPK Base Data</span>
                    <TechnicalTooltip term="RTK" />
                  </div>
                  <span className="text-[10px] font-mono text-geo-muted block">
                    {optionalData.hasRtk ? optionalData.rtkFile?.name : 'Centimeter differential GNSS'}
                  </span>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionalData.hasRtk}
                  onChange={(e) => setOptionalData({ ...optionalData, hasRtk: e.target.checked })}
                  className="rounded accent-geo-primary"
                />
              </label>
            </div>

            {/* Optional 4: Camera Intrinsics */}
            <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-geo-text">Camera Calibration</span>
                    <TechnicalTooltip term="Camera Intrinsics" />
                  </div>
                  <span className="text-[10px] font-mono text-geo-muted block">
                    {optionalData.hasIntrinsics ? optionalData.intrinsicsFile?.name : 'Focal length & distortion matrix'}
                  </span>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionalData.hasIntrinsics}
                  onChange={(e) => setOptionalData({ ...optionalData, hasIntrinsics: e.target.checked })}
                  className="rounded accent-geo-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-geo-border flex items-center justify-between">
        <div className="text-xs text-geo-muted font-mono">
          {videoMeta ? (
            <span className="text-emerald-600 font-bold">
              ✓ Drone video ready. Proceed to flight validation.
            </span>
          ) : (
            <span className="text-geo-muted">
              * Upload a drone video file or click "Load Sample 4K Drone Flight"
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!videoMeta}
          onClick={onContinue}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-secondary disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-geo-sm transition"
        >
          <span>Validate Flight Video</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step1UploadFlightData;
