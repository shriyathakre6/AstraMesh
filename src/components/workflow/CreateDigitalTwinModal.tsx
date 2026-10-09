import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Check, 
  Video, 
  Gauge, 
  Cpu, 
  Box, 
  ShieldCheck,
  AlertTriangle,
  Camera,
  Compass,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Step1UploadFlightData from './Step1UploadFlightData';
import Step4ResultViewer from './Step4ResultViewer';
import Step5AccuracyReport from './Step5AccuracyReport';
import ExportModelModal from './ExportModelModal';
import FlightAnalysisView from '../reconstruction/FlightAnalysisView';
import FrameSamplingTimeline from '../reconstruction/FrameSamplingTimeline';
import ColmapSfmView from '../reconstruction/ColmapSfmView';
import SparsePointCloudViewer from '../reconstruction/SparsePointCloudViewer';
import GeoreferencedMapView from '../reconstruction/GeoreferencedMapView';
import BeforeAfterScrubber from '../reconstruction/BeforeAfterScrubber';
import { FlightVideoMetadata, OptionalFlightData } from '../../types';
import { AnalyzedFrame } from '../../utils/frameAnalysis';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDigitalTwinModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const { 
    workflowStep, 
    setWorkflowStep, 
    activeJob, 
    runFlightValidation, 
    setCurrentPage,
    showToast
  } = useApp();

  // Local draft state
  const [videoMeta, setVideoMeta] = useState<FlightVideoMetadata | null>(
    activeJob?.videoMeta || null
  );

  const [optionalData, setOptionalData] = useState<OptionalFlightData>(
    activeJob?.optionalData || {
      hasGps: true,
      gpsFile: { name: 'FlightLog_Raven04_GNSS_10Hz.csv', sizeKb: 124, pointsCount: 285 },
      hasImu: true,
      hasRtk: true,
      hasIntrinsics: true,
      hasGcp: false
    }
  );

  const [selectedAnalyzedFrames, setSelectedAnalyzedFrames] = useState<AnalyzedFrame[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // 7 Guided Scientific Steps
  const stepsList = [
    { num: 1, name: 'Upload Video', icon: Video },
    { num: 2, name: 'Flight Analysis', icon: Gauge },
    { num: 3, name: 'Frame Sampling', icon: Camera },
    { num: 4, name: 'COLMAP SfM', icon: Cpu },
    { num: 5, name: 'Sparse Cloud', icon: Layers },
    { num: 6, name: 'Georeference Map', icon: Compass },
    { num: 7, name: '3D Digital Twin', icon: Box },
  ];

  const handleStep1Continue = async () => {
    if (!videoMeta) return;
    await runFlightValidation(videoMeta, optionalData);
    setWorkflowStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-space-950/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-5xl max-h-[94vh] rounded-2xl bg-space-900 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-space-850 via-space-900 to-space-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold font-mono">
              3D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  Single-Pass Drone Video Reconstruction
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                  SIH26158
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end pipeline: Ingestion → Frame Sampling → COLMAP SfM → Georeferencing → 3D Reality
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Wizard Indicator (7 Steps) */}
        <div className="px-6 py-2.5 bg-space-950/80 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {stepsList.map((st, idx) => {
              const isDone = workflowStep > st.num;
              const isCurrent = workflowStep === st.num;
              const Icon = st.icon;

              return (
                <React.Fragment key={st.num}>
                  <div 
                    onClick={() => {
                      if (isDone) setWorkflowStep(st.num);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition ${
                      isDone ? 'opacity-90 hover:opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-space-950'
                        : isCurrent
                        ? 'bg-cyan-400 text-space-950 ring-4 ring-cyan-500/20 shadow-neon-cyan'
                        : 'bg-space-800 text-slate-400'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                    </div>

                    <span className={`text-xs font-bold whitespace-nowrap ${
                      isCurrent ? 'text-white' : 'text-slate-400'
                    }`}>
                      {st.name}
                    </span>
                  </div>

                  {idx < stepsList.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2.5 transition-colors ${
                      workflowStep > st.num ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {workflowStep === 1 && (
            <Step1UploadFlightData
              videoMeta={videoMeta}
              setVideoMeta={setVideoMeta}
              optionalData={optionalData}
              setOptionalData={setOptionalData}
              onContinue={handleStep1Continue}
            />
          )}

          {workflowStep === 2 && videoMeta && (
            <FlightAnalysisView
              videoMeta={videoMeta}
              optionalData={optionalData}
              onProceedToSampling={() => setWorkflowStep(3)}
              onBackToUpload={() => setWorkflowStep(1)}
            />
          )}

          {workflowStep === 3 && (
            <FrameSamplingTimeline
              onProceedToColmap={(frames) => {
                setSelectedAnalyzedFrames(frames);
                setWorkflowStep(4);
              }}
              onBackToAnalysis={() => setWorkflowStep(2)}
            />
          )}

          {workflowStep === 4 && (
            <ColmapSfmView
              selectedFrames={selectedAnalyzedFrames}
              hasGps={optionalData.hasGps}
              onProceedToSparseCloud={() => setWorkflowStep(5)}
              onBackToSampling={() => setWorkflowStep(3)}
            />
          )}

          {workflowStep === 5 && (
            <SparsePointCloudViewer
              registeredCount={selectedAnalyzedFrames.length || 10}
              onProceedToDense={() => setWorkflowStep(6)}
              onBackToColmap={() => setWorkflowStep(4)}
            />
          )}

          {workflowStep === 6 && activeJob && (
            <GeoreferencedMapView
              accuracyReport={activeJob.accuracyReport}
              hasGps={optionalData.hasGps}
              onProceedToDigitalTwin={() => setWorkflowStep(7)}
              onBackToDense={() => setWorkflowStep(5)}
            />
          )}

          {workflowStep === 7 && activeJob && (
            <Step4ResultViewer
              job={activeJob}
              onOpenFullViewer={() => {
                onClose();
                setCurrentPage('digital-twin');
              }}
              onContinueToAccuracy={() => setIsExportModalOpen(true)}
              onOpenFrameExplorer={() => setWorkflowStep(3)}
            />
          )}
        </div>
      </div>

      {/* Real Export Modal */}
      {isExportModalOpen && activeJob && (
        <ExportModelModal
          job={activeJob}
          onClose={() => setIsExportModalOpen(false)}
          onDownloadFeedback={(msg) => showToast(`Downloaded: ${msg}`, 'success')}
        />
      )}
    </div>
  );
};

export default CreateDigitalTwinModal;
