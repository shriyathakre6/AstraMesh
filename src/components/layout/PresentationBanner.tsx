import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Compass, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface StepInfo {
  step: number;
  stageName: string;
  title: string;
  description: string;
  actionText: string;
}

const SIH_JUDGE_DEMO_STEPS: StepInfo[] = [
  { 
    step: 1, 
    stageName: 'Problem', 
    title: 'The Challenge: Single-Pass Video Photogrammetry', 
    description: 'Traditional photogrammetry demands crosshatch flight grids and heavy offline compute. AstraMesh3D reconstructs 3D reality from a single pass.', 
    actionText: '1. Problem Overview' 
  },
  { 
    step: 2, 
    stageName: 'Upload Video', 
    title: 'Drone Video & Telemetry Ingestion', 
    description: 'User uploads raw single-pass 4K video (MP4/MOV) with optional GPS/IMU/RTK. Clear mandatory vs optional separation.', 
    actionText: '2. Upload Drone Video' 
  },
  { 
    step: 3, 
    stageName: 'Flight Validation', 
    title: 'Autonomous Quality & Sensor Validation', 
    description: 'Automated check for motion blur, illumination, and non-blocking GPS. Gracefully falls back to visual odometry.', 
    actionText: '3. Validate Flight Data' 
  },
  { 
    step: 4, 
    stageName: 'Frame Sampling', 
    title: 'Intelligent Frame Sampling & Rejection', 
    description: 'Adaptive keyframe extraction filtering out blurred, dark, or duplicate frames before compute-heavy feature extraction.', 
    actionText: '4. Run Frame Sampling' 
  },
  { 
    step: 5, 
    stageName: 'AI Depth', 
    title: 'Foundation Depth & Pose Estimation', 
    description: 'Structure-from-Motion (SfM) camera orientation combined with monocular deep learning depth estimation.', 
    actionText: '5. AI Depth Estimation' 
  },
  { 
    step: 6, 
    stageName: 'Point Cloud', 
    title: '1.4M Dense Point Cloud Generation', 
    description: 'Multi-view stereo triangulation producing 1,428,500 spatial coordinates with RGB photogrammetric attribution.', 
    actionText: '6. Inspect Point Cloud' 
  },
  { 
    step: 7, 
    stageName: '3D Mesh', 
    title: 'Watertight Poisson Mesh Reconstruction', 
    description: 'Extracting 385,000 polygon triangles with texture blending and LOD hierarchy for instant browser rendering.', 
    actionText: '7. Generate 3D Mesh' 
  },
  { 
    step: 8, 
    stageName: 'Georeferencing', 
    title: 'RTK/PPK GNSS Coordinate Alignment', 
    description: 'Locking model into EPSG:4326 (WGS 84 / UTM 43N) with sub-meter scale verification and ground sample distance audit.', 
    actionText: '8. Check Georeferencing' 
  },
  { 
    step: 9, 
    stageName: 'Digital Twin', 
    title: 'Interactive 3D Digital Reality Model', 
    description: 'Full Three.js WebGL scene with orbit controls, flight trajectory spline, and layer compositing.', 
    actionText: '9. Explore Digital Twin' 
  },
  { 
    step: 10, 
    stageName: 'Measurement', 
    title: 'Interactive 3D Surface Measurements', 
    description: 'User clicks on the 3D model to calculate real-world distance, vertical height, area, and georeferenced coordinates.', 
    actionText: '10. Test 3D Measurements' 
  },
  { 
    step: 11, 
    stageName: 'Final Result', 
    title: 'Accuracy Verification & Multi-Format Export', 
    description: 'Final audit report showing RMSE 0.72 px, high confidence status, and export to GLB, OBJ, PLY, and executive PDF.', 
    actionText: '11. View Final Dossier' 
  }
];

export const PresentationBanner: React.FC = () => {
  const { demoStep, setDemoStep, nextDemoStep, prevDemoStep, presentationMode } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentStepInfo = SIH_JUDGE_DEMO_STEPS[demoStep - 1] || SIH_JUDGE_DEMO_STEPS[0];

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-12 right-6 z-40 px-3.5 py-2 rounded-full bg-cyan-500 text-space-950 font-bold text-xs shadow-neon-cyan flex items-center gap-2 hover:bg-cyan-400 transition"
      >
        <Sparkles className="w-4 h-4" />
        <span>SIH Judge Demo ({demoStep}/11)</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-space-950 via-space-900 to-space-950 border-b border-cyan-500/30 px-4 py-2 z-30 flex flex-wrap items-center justify-between gap-3 shadow-glass font-sans">
      {/* Step Indicator & Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>SIH26158 JUDGE TOUR: {demoStep} OF 11</span>
        </div>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-white">
              {currentStepInfo.title}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-space-950 px-1.5 py-0.5 rounded border border-slate-800">
              STAGE: {currentStepInfo.stageName.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 max-w-xl truncate">
            {currentStepInfo.description}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2 font-mono">
        <button
          onClick={() => setDemoStep(1)}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white text-xs transition"
          title="Restart Judge Presentation Flow"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start Judge Demo</span>
        </button>

        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs transition"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextDemoStep}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-bold text-xs shadow-neon-cyan transition"
        >
          <span>{demoStep === 11 ? 'Restart Tour' : currentStepInfo.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition"
          title="Minimize Demo Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PresentationBanner;
