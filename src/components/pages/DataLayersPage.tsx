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
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Layers className="w-3.5 h-3.5 text-geo-teal" />
            <span>Multi-Source Spatial Data Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Data Layers Management
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Configure multi-spectral satellite imagery, DEM rasters, LiDAR point clouds, and 4K UAV photogrammetry feeds.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadStep('form');
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white font-bold text-xs shadow-geo-sm transition"
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
          <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                    filterCategory === cat
                      ? 'bg-geo-blue-light text-geo-primary border border-geo-border font-bold'
                      : 'text-geo-text-sub hover:text-geo-text-main hover:bg-geo-bg'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-geo-text-muted absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter layers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-geo-bg border border-geo-border text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary"
              />
            </div>
          </div>

          {/* Layer Cards */}
          <div className="space-y-3">
            {filteredLayers.map(layer => (
              <div
                key={layer.id}
                className={`p-4 rounded-2xl bg-white border transition-all duration-200 ${
                  layer.active
                    ? 'border-geo-primary/30 shadow-geo-sm'
                    : 'border-geo-border opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Layer Info & Toggle */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className={`mt-0.5 p-2 rounded-xl transition ${
                        layer.active
                          ? 'bg-geo-blue-light text-geo-primary border border-geo-border'
                          : 'bg-geo-bg text-geo-text-sub border border-geo-border hover:text-geo-text-main'
                      }`}
                      title={layer.active ? 'Disable Layer' : 'Enable Layer'}
                    >
                      {layer.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${layer.active ? 'text-geo-primary' : 'text-geo-text-sub'}`}>
                          {layer.name}
                        </h4>
                        <StatusBadge status={layer.status} size="sm" />
                      </div>
                      <p className="text-xs text-geo-text-sub mt-0.5 leading-relaxed">
                        {layer.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-geo-text-sub">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-geo-teal" />
                          <span>{layer.dataSource}</span>
                        </span>
                        <span className="text-geo-border">•</span>
                        <span>{layer.resolution}</span>
                        <span className="text-geo-border">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-geo-text-muted" />
                          <span>{layer.lastUpdated}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                      layer.active ? 'bg-geo-teal justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>

                {/* Opacity Slider Control */}
                {layer.active && (
                  <div className="mt-3 pt-3 border-t border-geo-border flex items-center gap-3 pl-11">
                    <Sliders className="w-3.5 h-3.5 text-geo-text-sub" />
                    <span className="text-xs font-mono text-geo-text-sub">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={layer.opacity}
                      onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                      className="w-48 h-1.5 bg-geo-border rounded-lg appearance-none cursor-pointer accent-geo-primary"
                    />
                    <span className="text-xs font-mono text-geo-primary font-bold w-10">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Real-time Layer Preview in 3D Canvas */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm p-4 flex flex-col h-[600px]">
          <div className="pb-3 border-b border-geo-border flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-geo-primary uppercase tracking-wider font-mono">
                Layer Viewport Preview
              </h3>
              <p className="text-[11px] text-geo-text-sub">Real-time overlay blending</p>
            </div>
            <span className="text-xs font-mono text-geo-teal font-bold">
              {dataLayers.filter(l => l.active).length} Active Layers
            </span>
          </div>

          <div className="flex-1 mt-3 relative rounded-xl overflow-hidden border border-geo-border bg-[#E8EFF7]">
            <DigitalTwinCanvas isMiniPreview={true} />
          </div>
        </div>
      </div>

      {/* Upload New Dataset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-geo-border shadow-geo-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-geo-border">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-geo-primary" />
                <h3 className="text-sm font-bold text-geo-primary uppercase font-mono">
                  Ingest Spatial Dataset
                </h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded text-geo-text-sub hover:text-geo-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadStep === 'form' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-geo-text-main mb-1">Dataset Title</label>
                  <input
                    type="text"
                    value={datasetTitle}
                    onChange={(e) => setDatasetTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-geo-border bg-geo-bg text-geo-text-main focus:outline-none focus:border-geo-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-geo-text-main mb-1">Dataset Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadDatasetType('drone')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        uploadDatasetType === 'drone'
                          ? 'bg-geo-blue-light border-geo-primary text-geo-primary font-bold'
                          : 'bg-white border-geo-border text-geo-text-sub'
                      }`}
                    >
                      <div className="font-semibold">UAV Drone Video</div>
                      <div className="text-[10px] text-geo-text-sub font-normal">Single-Pass Photogrammetry</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadDatasetType('satellite')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        uploadDatasetType === 'satellite'
                          ? 'bg-geo-blue-light border-geo-primary text-geo-primary font-bold'
                          : 'bg-white border-geo-border text-geo-text-sub'
                      }`}
                    >
                      <div className="font-semibold">Satellite DEM / Ortho</div>
                      <div className="text-[10px] text-geo-text-sub font-normal">GeoTIFF / HDF5 Surface</div>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-geo-bg border border-geo-border space-y-2">
                  <span className="text-[11px] font-bold text-geo-primary block">Included Sensor Feeds:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-geo-text-main">
                    <input
                      type="checkbox"
                      checked={includeOptionalIMU}
                      onChange={(e) => setIncludeOptionalIMU(e.target.checked)}
                      className="rounded text-geo-primary"
                    />
                    <span>Synchronize 9-DOF IMU Attitude Telemetry</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-geo-text-main">
                    <input
                      type="checkbox"
                      checked={includeOptionalRTK}
                      onChange={(e) => setIncludeOptionalRTK(e.target.checked)}
                      className="rounded text-geo-primary"
                    />
                    <span>RTK/PPK Centimeter Baseline Fixes</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl bg-geo-bg border border-geo-border text-geo-text-sub hover:text-geo-text-main font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartUpload}
                    className="px-4 py-2 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white font-bold shadow-geo-sm"
                  >
                    Process Dataset
                  </button>
                </div>
              </div>
            )}

            {uploadStep === 'processing' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-geo-blue-light border-t-geo-primary animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-geo-primary">Ingesting & Processing Layer</h4>
                  <p className="text-xs text-geo-text-sub mt-1">{progressStatusText}</p>
                </div>
                <div className="w-full bg-geo-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-geo-primary h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStep === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-geo-primary">Dataset Ready & Loaded</h4>
                  <p className="text-xs text-geo-text-sub mt-1">
                    Layer has been orthorectified and linked to the active 3D Digital Twin scene.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-bold shadow-geo-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLayersPage;
