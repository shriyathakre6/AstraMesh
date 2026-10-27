import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, X, Tv, CheckCircle2 } from 'lucide-react';

export const PresentationBanner: React.FC = () => {
  const { 
    presentationMode, 
    togglePresentationMode, 
    demoStep, 
    nextDemoStep, 
    prevDemoStep 
  } = useApp();

  if (!presentationMode) return null;

  const demoTourSteps = [
    { step: 1, title: 'Overview & Mission Intelligence', page: 'overview' },
    { step: 2, title: '3D Digital Twin & Terrain Geometry', page: 'digital-twin' },
    { step: 3, title: 'Single-Pass Drone Video Ingestion', page: 'digital-twin' },
    { step: 4, title: 'Multi-Source Geospatial Data Layers', page: 'data-layers' },
    { step: 5, title: 'Spatial Analysis & Slope Stability', page: 'analysis' },
    { step: 6, title: 'Real-time Station Monitoring', page: 'monitoring' },
    { step: 7, title: 'Intelligence Alerts & Risk Matrix', page: 'alerts' },
    { step: 8, title: 'Executive Mission Dossier & Reports', page: 'reports' },
  ];

  const currentTour = demoTourSteps[demoStep - 1] || demoTourSteps[0];

  return (
    <div className="bg-gradient-to-r from-geo-blue-light via-white to-geo-mint-light border-b border-geo-border px-4 py-2 flex items-center justify-between text-xs z-20 shadow-geo-sm">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-geo-primary text-white font-mono text-[10px] font-bold">
          <Tv className="w-3 h-3" />
          <span>SIH PRESENTATION MODE</span>
        </span>
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-bold text-geo-text-main">
            Step {demoStep} of {demoTourSteps.length}:
          </span>
          <span className="text-geo-primary font-semibold">
            {currentTour.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          className="p-1.5 rounded-lg bg-white hover:bg-geo-bg border border-geo-border text-geo-text-main disabled:opacity-40 transition"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-mono text-xs text-geo-text-sub px-1">
          {demoStep}/{demoTourSteps.length}
        </span>

        <button
          onClick={nextDemoStep}
          disabled={demoStep === demoTourSteps.length}
          className="p-1.5 rounded-lg bg-white hover:bg-geo-bg border border-geo-border text-geo-text-main disabled:opacity-40 transition"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={togglePresentationMode}
          className="ml-2 p-1.5 rounded-lg text-geo-text-sub hover:text-geo-text-main hover:bg-white transition"
          title="Exit Presentation Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PresentationBanner;
