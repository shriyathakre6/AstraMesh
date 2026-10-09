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
      <div className="p-4 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-glass">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI Reconstruction Kernel Running</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-bold">JOB ID: {job.id}</span>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            Single-Pass 3D Photogrammetry Pipeline
          </h2>
        </div>

        {/* Mandatory Transparency Badge required by prompt */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 shadow-neon-amber">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulation / Prototype Mode</span>
          </span>

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl bg-space-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-mono transition flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Current Stage ({currentStage.id}/14):</span>
            <span className="text-white font-bold">{currentStage.name}</span>
          </div>
          <span className="text-cyan-300 font-bold text-sm">{overallProgress}% Overall</span>
        </div>

        <div className="w-full bg-space-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          {currentStage.description}
        </p>
      </div>

      {/* 14 Conceptual Stages List (2-column responsive layout) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
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
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-neon-cyan'
                    : 'bg-space-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-[10px] text-slate-500 w-4 text-right flex-shrink-0">
                    {stage.id}.
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  )}

                  <div className="truncate">
                    <span className={`font-bold block truncate ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  {isCompleted ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : isCurrent ? (
                    <span className="text-cyan-300 font-bold animate-pulse">
                      {stage.progress}%
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about real photogrammetry backend */}
      <div className="p-3 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>GPU Mesh Worker: WebGL Raymarch Adapter (Asynchronous Job Queue)</span>
        </span>
        <span className="text-emerald-400 font-semibold">VSync 60 FPS</span>
      </div>
    </div>
  );
};

export default Step3PipelineProcessing;
