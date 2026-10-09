import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataLayer } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';
import { 
  Layers, 
  Upload, 
  Eye, 
  EyeOff, 
  Sliders, 
  Database, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  X, 
  Video, 
  Navigation, 
  Gauge, 
  Search,
  Filter,
  Plus
} from 'lucide-react';

export const DataLayersPage: React.FC = () => {
  const { dataLayers, toggleLayer, setLayerOpacity, addDatasetLayer, showToast } = useApp();
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Upload Modal State
  const [uploadStep, setUploadStep] = useState<'form' | 'processing' | 'success'>('form');
  const [uploadDatasetType, setUploadDatasetType] = useState<string>('drone');
  const [datasetTitle, setDatasetTitle] = useState<string>('Sector 4 - 4K UAV Survey Run');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatusText, setProgressStatusText] = useState<string>('');
  
  // Drone inputs
  const [includeOptionalIMU, setIncludeOptionalIMU] = useState<boolean>(true);
  const [includeOptionalRTK, setIncludeOptionalRTK] = useState<boolean>(true);

  const categories = ['ALL', 'Topography', 'Satellite', 'Sensor', 'Environmental', 'Risk', 'Infrastructure'];

  const filteredLayers = dataLayers.filter(layer => {
    const matchesCat = filterCategory === 'ALL' || layer.category === filterCategory;
    const matchesSearch = layer.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          layer.dataSource.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartUpload = () => {
    setUploadStep('processing');
    setProgressPercent(15);
    setProgressStatusText('Ingesting 4K H.265 Drone Video & Extracting Keyframes...');

    setTimeout(() => {
      setProgressPercent(45);
      setProgressStatusText('Parsing GPS Track & Synchronizing Flight Timestamp...');
    }, 900);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressStatusText('Applying RTK/PPK Corrections & Camera Intrinsics Calibration...');
    }, 1800);

    setTimeout(() => {
      setProgressPercent(95);
      setProgressStatusText('Tessellating 3D Mesh via Structure-from-Motion (SfM)...');
    }, 2700);

    setTimeout(() => {
      setProgressPercent(100);
      setProgressStatusText('Dataset successfully processed.');
      setUploadStep('success');

      // Add to data layers
      addDatasetLayer(
        datasetTitle,
        uploadDatasetType === 'drone' ? 'Topography' : 'Satellite',
        'Raven-04 UAV (4K RTK Orthomosaic)'
      );
    }, 3400);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setUploadStep('form');
    setProgressPercent(0);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Source Spatial Data Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Data Layers Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure multi-spectral satellite imagery, DEM rasters, LiDAR point clouds, and 4K UAV photogrammetry feeds.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadStep('form');
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-bold text-xs shadow-neon-cyan transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Dataset</span>
        </button>
      </div>

      {/* Main Content Grid: Layer Table (Left 7 Cols) + 3D Preview (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Layers Controller Table */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-space-900/80 backdrop-blur-md border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition ${
                    filterCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-space-850'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter layers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded bg-space-850 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Layer Cards / Table */}
          <div className="space-y-3">
            {filteredLayers.map(layer => (
              <div
                key={layer.id}
                className={`p-4 rounded-xl bg-space-900/80 backdrop-blur-md border transition-all duration-200 ${
                  layer.active
                    ? 'border-cyan-500/40 shadow-glass'
                    : 'border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Layer Info & Toggle */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className={`mt-0.5 p-2 rounded-lg transition ${
                        layer.active
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-space-850 text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}
                      title={layer.active ? 'Disable Layer' : 'Enable Layer'}
                    >
                      {layer.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${layer.active ? 'text-white' : 'text-slate-400'}`}>
                          {layer.name}
                        </h4>
                        <StatusBadge status={layer.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {layer.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-cyan-400" />
                          <span>{layer.dataSource}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>{layer.resolution}</span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{layer.lastUpdated}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 flex-shrink-0 ${
                      layer.active ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-space-950 shadow-md transform transition" />
                  </button>
                </div>

                {/* Opacity Slider Control */}
                {layer.active && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-3 pl-11">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono text-slate-400">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={layer.opacity}
                      onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                      className="w-48 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-cyan-300 w-10">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: 3D Preview Map Window */}
        <div className="lg:col-span-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass overflow-hidden flex flex-col h-[580px] sticky top-6">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-space-850/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Composite 3D Layer Preview
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              GPU ACCELERATED
            </span>
          </div>

          <div className="flex-1 relative w-full h-full min-h-0">
            <DigitalTwinCanvas isMiniPreview={true} />
          </div>

          <div className="p-3 bg-space-950/80 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Projection: EPSG:4326</span>
            <span className="text-emerald-400">Rendering {dataLayers.filter(l => l.active).length} Blended Layers</span>
          </div>
        </div>
      </div>

      {/* Upload New Dataset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-xl rounded-2xl bg-space-900 border border-cyan-500/40 shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-space-850 to-space-800 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Ingest Geospatial Dataset
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {uploadStep === 'form' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                      Dataset Type
                    </label>
                    <select
                      value={uploadDatasetType}
                      onChange={(e) => setUploadDatasetType(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-space-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value="drone">UAV Drone Video & Photogrammetry (1080p / 4K UHD)</option>
                      <option value="dem">Digital Elevation Model (GeoTIFF / DEM / Cloud Optimized GeoTIFF)</option>
                      <option value="lidar">LiDAR Point Cloud (.las / .laz 3D)</option>
                      <option value="satellite">Satellite Multispectral Orthomosaic (Sentinel-2 / Cartosat-3)</option>
                      <option value="vector">Vector Shapefile / GeoJSON Infrastructure Bounds</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                      Dataset Identifier / Mission Label
                    </label>
                    <input
                      type="text"
                      value={datasetTitle}
                      onChange={(e) => setDatasetTitle(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-space-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Specific Ingestion Specifications (Mandatory & Optional) */}
                  <div className="p-3.5 rounded-xl bg-space-950/80 border border-cyan-500/20 space-y-3 font-mono text-xs">
                    {/* Mandatory Elements */}
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                        ✓ Mandatory Flight Inputs (Detected & Bound)
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                        <div className="p-2 rounded bg-space-900 border border-slate-800">
                          <Video className="w-3.5 h-3.5 text-amber-400 mb-1" />
                          <span className="font-semibold block text-white">1080p / 4K Video</span>
                          <span className="text-[10px] text-slate-500">H.265 / ProRes</span>
                        </div>
                        <div className="p-2 rounded bg-space-900 border border-slate-800">
                          <Navigation className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                          <span className="font-semibold block text-white">GPS Coordinates</span>
                          <span className="text-[10px] text-slate-500">10 Hz Track Log</span>
                        </div>
                        <div className="p-2 rounded bg-space-900 border border-slate-800">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                          <span className="font-semibold block text-white">Flight Metadata</span>
                          <span className="text-[10px] text-slate-500">DJI/Pix4D JSON</span>
                        </div>
                      </div>
                    </div>

                    {/* Optional High-Precision Telemetry */}
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        + Optional High-Precision Calibration Data
                      </span>
                      <div className="space-y-1.5 text-[11px] text-slate-300">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeOptionalIMU}
                            onChange={(e) => setIncludeOptionalIMU(e.target.checked)}
                            className="rounded accent-cyan-400"
                          />
                          <span>IMU 9-DOF telemetry & barometric altitude sync</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeOptionalRTK}
                            onChange={(e) => setIncludeOptionalRTK(e.target.checked)}
                            className="rounded accent-cyan-400"
                          />
                          <span>Camera intrinsics matrix (f, cx, cy, k1, k2) + RTK/PPK GNSS corrections</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer bg-space-950/40 transition">
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-slate-300 font-medium">
                      Drag and drop aerial video footage, DEM files, or GNSS flight logs
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      Supports .mp4, .mov, .tif, .las, .kml, .geojson (up to 4 GB)
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-xs text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartUpload}
                      className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs shadow-neon-cyan transition"
                    >
                      Start Ingestion Pipeline
                    </button>
                  </div>
                </>
              )}

              {/* Processing Animation */}
              {uploadStep === 'processing' && (
                <div className="py-8 space-y-5 text-center font-mono">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Ingesting Spatial Dataset</h4>
                    <p className="text-xs text-cyan-300 mt-1">{progressStatusText}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{progressPercent}% Completed</span>
                </div>
              )}

              {/* Success Result */}
              {uploadStep === 'success' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-mono">
                      Dataset successfully processed.
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      "{datasetTitle}" has been orthorectified, registered to EPSG:4326, and composited into the live 3D Digital Twin mesh.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-space-950 border border-slate-800 text-left font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">RESOLUTION:</span>
                      <span className="text-cyan-300">0.05m Ground Sample Distance (GSD)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RTK ACCURACY:</span>
                      <span className="text-emerald-400">±1.4 cm Horizontal, ±2.1 cm Vertical</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">STATUS:</span>
                      <span className="text-emerald-400">ACTIVE & READY FOR 3D VISUALIZATION</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs shadow-neon-cyan transition"
                  >
                    Done & View Layer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLayersPage;
