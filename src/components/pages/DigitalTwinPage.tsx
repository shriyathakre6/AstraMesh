import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';
import BeforeAfterScrubber from '../reconstruction/BeforeAfterScrubber';
import GeoreferencedMapView from '../reconstruction/GeoreferencedMapView';
import GeneratedDigitalTwinWorkspace from '../digitaltwin/GeneratedDigitalTwinWorkspace';
import { 
  Video, 
  Navigation, 
  Crosshair, 
  Compass, 
  Radio, 
  Eye, 
  Sliders, 
  Layers, 
  Maximize2, 
  ShieldAlert, 
  Activity, 
  X,
  Gauge,
  Camera,
  Satellite,
  Sparkles,
  Box
} from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { 
    selectedMission, 
    highlightedZone, 
    setHighlightedZone, 
    riskZones, 
    stations, 
    selectedStation, 
    setSelectedStation,
    setCameraFocusTarget,
    activeJob
  } = useApp();

  const [activeView, setActiveView] = useState<'workspace' | '3d_model' | 'before_after' | 'georeferenced_map'>('workspace');
  const [droneFeedActive, setDroneFeedActive] = useState<boolean>(false);

  return (
    <div className="space-y-4 font-sans">
      {/* Top View Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-geo-blue-light text-geo-primary flex items-center justify-center font-bold">
            <Box className="w-4 h-4 text-geo-primary" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-geo-primary uppercase tracking-wider block">
              Reconstructed Reality Workspace
            </span>
            <span className="text-xs font-mono text-geo-text-sub">
              {activeJob?.title || 'Sector 7 Himalayan Escarpment'}
            </span>
          </div>
        </div>

        {/* View Switcher: 10-Tab Workspace vs 3D Twin vs Before/After vs Map */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-geo-bg border border-geo-border font-mono text-xs overflow-x-auto">
            <button
              onClick={() => setActiveView('workspace')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-bold ${
                activeView === 'workspace'
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border'
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              10-Tab Reconstruction Workspace
            </button>
            <button
              onClick={() => setActiveView('3d_model')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-bold ${
                activeView === '3d_model'
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border'
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              Full 3D Scene Viewport
            </button>
            <button
              onClick={() => setActiveView('before_after')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-bold ${
                activeView === 'before_after'
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border'
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              Before → After Scrubber
            </button>
            <button
              onClick={() => setActiveView('georeferenced_map')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-bold ${
                activeView === 'georeferenced_map'
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border'
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              Georeferenced Map
            </button>
          </div>

          {activeView === '3d_model' && (
            <button
              onClick={() => setDroneFeedActive(!droneFeedActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                droneFeedActive
                  ? 'bg-amber-500 text-white shadow-geo-sm'
                  : 'bg-white hover:bg-geo-bg text-amber-700 border border-amber-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{droneFeedActive ? 'Hide PiP' : '4K PiP Feed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on Active View */}
      {activeView === 'workspace' ? (
        <GeneratedDigitalTwinWorkspace />
      ) : activeView === 'before_after' ? (
        <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
          <BeforeAfterScrubber videoName={activeJob?.videoMeta.fileName || 'UAV_Raven04_Sector7_4K.mp4'} />
        </div>
      ) : activeView === 'georeferenced_map' && activeJob ? (
        <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm">
          <GeoreferencedMapView
            accuracyReport={activeJob.accuracyReport}
            hasGps={activeJob.optionalData.hasGps}
            onProceedToDigitalTwin={() => setActiveView('workspace')}
            onBackToDense={() => setActiveView('workspace')}
          />
        </div>
      ) : (
        <div className="relative w-full h-[calc(100vh-13.5rem)] rounded-2xl overflow-hidden border border-geo-border shadow-geo-sm bg-[#E8EFF7] font-sans">
          {/* Three.js Digital Twin Canvas (Full Viewport) */}
          <DigitalTwinCanvas className="w-full h-full" />

          {/* 1080p/4K Drone Aerial Reconnaissance PiP Video HUD */}
          {droneFeedActive && (
            <div className="absolute top-4 right-4 z-30 w-84 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-xl overflow-hidden animate-fade-in font-mono text-xs">
              <div className="p-2.5 bg-geo-bg border-b border-geo-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-geo-primary font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>UAV RECON FLIGHT: RAVEN-04 [4K/60FPS]</span>
                </div>
                <button
                  onClick={() => setDroneFeedActive(false)}
                  className="p-1 rounded text-geo-text-sub hover:text-geo-text-main hover:bg-geo-blue-light transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative w-full h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden flex items-center justify-center text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute w-full h-px bg-cyan-400/40" />
                <div className="absolute h-full w-px bg-cyan-400/40" />

                <div className="relative z-10 w-20 h-20 border border-amber-400/60 rounded-lg flex items-center justify-center">
                  <Crosshair className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '30s' }} />
                  <span className="absolute -bottom-4 text-[9px] text-amber-300 font-bold tracking-wider">
                    ZONE ALPHA
                  </span>
                </div>

                <div className="absolute top-2 left-2.5 text-[10px] text-slate-200 flex flex-col gap-0.5 font-bold">
                  <span className="text-amber-300">RES: 3840x2160 UHD (4K)</span>
                  <span>BITRATE: 48.2 Mbps H.265</span>
                </div>

                <div className="absolute top-2 right-2.5 text-[10px] text-right">
                  <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse">
                    REC 00:14:38
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white space-y-2 border-t border-geo-border text-[11px]">
                <div className="grid grid-cols-2 gap-1.5 bg-geo-bg p-2 rounded-xl border border-geo-border text-geo-text-main">
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">GPS COORDINATES</span>
                    <span className="text-geo-primary font-bold">34°17'45.2"N 77°56'48.1"E</span>
                  </div>
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">FLIGHT SPEED / HDG</span>
                    <span className="text-geo-text-main font-bold">18.4 m/s • 042° NE</span>
                  </div>
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">BARO ALTITUDE</span>
                    <span className="text-emerald-700 font-bold">1,124.5 m AMSL</span>
                  </div>
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">RTK/PPK GNSS FIX</span>
                    <span className="text-emerald-700 font-bold">RTK FIXED (±1.4 cm)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCameraFocusTarget({ position: [-6, 3.5, 6], label: 'Zone Alpha Drone Target' });
                  }}
                  className="w-full py-1.5 rounded-lg bg-geo-primary hover:bg-geo-primary-hover text-white text-center font-bold transition shadow-geo-sm"
                >
                  Track Target in 3D Viewport
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DigitalTwinPage;
