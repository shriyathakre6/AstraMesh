import React from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  X, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PipelineStage, ReconstructionJob } from '../../types';

interface Step3Props {
  job: ReconstructionJob;
  stages: PipelineStage[];
  currentStageIndex: number;
  overallProgress: number;
  onCancel: () => void;
}

export const Step3PipelineProcessing: React.FC<Step3Props> = ({
  job,
  stages,
  currentStageIndex,
  overallProgress,
  onCancel
}) => {
  const currentStage = stages[currentStageIndex] || stages[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner with Job ID & Prototype Simulation Badge */}
      <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Cpu className="w-4 h-4 text-geo-teal animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI Reconstruction Kernel Running</span>
            <span className="text-geo-border">|</span>
            <span className="text-amber-600 font-bold">JOB ID: {job.id}</span>
          </div>
          <h2 className="text-lg font-extrabold text-geo-primary">
            Single-Pass 3D Photogrammetry Pipeline
          </h2>
        </div>

        {/* Mandatory Transparency Badge required by prompt */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulation / Prototype Mode</span>
          </span>

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-geo-border hover:border-rose-200 text-geo-muted hover:text-rose-600 text-xs font-mono transition flex items-center gap-1.5 shadow-geo-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="p-4 rounded-xl bg-white border border-geo-border shadow-geo-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-geo-primary font-bold">Current Stage ({currentStage.id}/14):</span>
            <span className="text-geo-text font-bold">{currentStage.name}</span>
          </div>
          <span className="text-geo-teal font-bold text-sm">{overallProgress}% Overall</span>
        </div>

        <div className="w-full bg-geo-bg rounded-full h-2.5 overflow-hidden border border-geo-border">
          <div 
            className="bg-gradient-to-r from-geo-primary via-geo-secondary to-geo-teal h-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p className="text-[11px] text-geo-muted font-mono">
          {currentStage.description}
        </p>
      </div>

      {/* 14 Conceptual Stages List (2-column responsive layout) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-geo-muted px-1 font-semibold">
          <span>PIPELINE STAGE EXECUTION LOG (14 STAGES)</span>
          <span>STATUS / PROGRESS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  isCompleted
                    ? 'bg-geo-mint/40 border-emerald-200 text-emerald-800'
                    : isCurrent
                    ? 'bg-geo-blue-light border-2 border-geo-primary text-geo-primary shadow-geo-sm'
                    : 'bg-white border-geo-border text-geo-muted'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-[10px] text-geo-muted w-4 text-right flex-shrink-0">
                    {stage.id}.
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-geo-primary animate-spin flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-geo-muted flex-shrink-0" />
                  )}

                  <div className="truncate">
                    <span className={`font-bold block truncate ${
                      isCurrent ? 'text-geo-primary' : isCompleted ? 'text-geo-text' : 'text-geo-muted'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  {isCompleted ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : isCurrent ? (
                    <span className="text-geo-primary font-bold animate-pulse">
                      {stage.progress}%
                    </span>
                  ) : (
                    <span className="text-geo-muted">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about real photogrammetry backend */}
      <div className="p-3 rounded-xl bg-white border border-geo-border shadow-geo-sm flex items-center justify-between text-[11px] font-mono text-geo-muted">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-geo-teal" />
          <span>GPU Mesh Worker: WebGL Raymarch Adapter (Asynchronous Job Queue)</span>
        </span>
        <span className="text-emerald-600 font-semibold">VSync 60 FPS</span>
      </div>
    </div>
  );
};

export default Step3PipelineProcessing;
