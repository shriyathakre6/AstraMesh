import React from 'react';
import { 
  Ruler, 
  Maximize2, 
  ArrowUpDown, 
  MapPin, 
  Trash2, 
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { MeasurementMode, MeasurementResult } from '../../types';

interface MeasurementOverlayProps {
  activeTool: MeasurementMode;
  setActiveTool: (mode: MeasurementMode) => void;
  measurements: MeasurementResult[];
  onClear: () => void;
  onClose: () => void;
}

export const MeasurementOverlay: React.FC<MeasurementOverlayProps> = ({
  activeTool,
  setActiveTool,
  measurements,
  onClear,
  onClose
}) => {
  const tools: { id: MeasurementMode; label: string; icon: React.ElementType; instruction: string }[] = [
    { id: 'distance', label: 'Distance', icon: Ruler, instruction: 'Click 2 points on the 3D model to calculate surface distance' },
    { id: 'height', label: 'Height', icon: ArrowUpDown, instruction: 'Click base and peak points to calculate relative vertical elevation' },
    { id: 'area', label: 'Area', icon: Maximize2, instruction: 'Click 3 or more points to form a polygon surface area calculation' },
    { id: 'coordinates', label: 'Coordinates', icon: MapPin, instruction: 'Click any point on the 3D mesh to read georeferenced coordinates' },
  ];

  const currentToolInfo = tools.find(t => t.id === activeTool);

  return (
    <div className="absolute top-16 left-4 z-20 w-80 sm:w-96 rounded-xl bg-space-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl p-4 font-sans animate-fade-in text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            3D Spatial Measurement Tool
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Prototype Label required by prompt */}
      <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
        <span>Prototype Measurement Mode (Simulated Scale)</span>
      </div>

      {/* Tool Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
        {tools.map(t => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(isActive ? 'none' : t.id)}
              className={`p-2 rounded-lg border flex flex-col items-center gap-1 font-mono transition text-center ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-neon-cyan'
                  : 'bg-space-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-space-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool Instruction */}
      {currentToolInfo && (
        <div className="mt-3 p-2.5 rounded-lg bg-space-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
          <span className="text-slate-400 block text-[9px] uppercase font-bold">Active Tool Instruction:</span>
          {currentToolInfo.instruction}
        </div>
      )}

      {/* Measurement Results List */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>MEASUREMENTS RECORDED ({measurements.length})</span>
          {measurements.length > 0 && (
            <button
              onClick={onClear}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {measurements.length === 0 ? (
          <div className="p-3 rounded-lg bg-space-950/60 border border-slate-800/80 text-center text-[11px] text-slate-500 font-mono">
            Click on 3D terrain surface to place measurement pins
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs">
            {measurements.map(m => (
              <div 
                key={m.id}
                className="p-2 rounded bg-space-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">{m.label}</span>
                  <span className="text-cyan-300 font-bold text-sm">{m.value} {m.unit}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-space-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {m.points.length} PINS
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementOverlay;
