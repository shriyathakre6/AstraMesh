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
    <div className="absolute top-16 left-4 z-20 w-80 sm:w-96 rounded-xl bg-white border border-geo-border shadow-geo-xl p-4 font-sans animate-fade-in text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-geo-border">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-geo-primary" />
          <span className="font-mono text-xs font-bold text-geo-primary uppercase tracking-wider">
            3D Spatial Measurement Tool
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-geo-muted hover:text-geo-text hover:bg-geo-bg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Prototype Label required by prompt */}
      <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-mono flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
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
                  ? 'bg-geo-blue-light text-geo-primary border-geo-primary font-bold shadow-geo-sm'
                  : 'bg-white border-geo-border text-geo-muted hover:text-geo-text hover:bg-geo-bg'
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
        <div className="mt-3 p-2.5 rounded-lg bg-geo-bg border border-geo-border font-mono text-[11px] text-geo-primary">
          <span className="text-geo-muted block text-[9px] uppercase font-bold">Active Tool Instruction:</span>
          {currentToolInfo.instruction}
        </div>
      )}

      {/* Measurement Results List */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-geo-muted">
          <span>MEASUREMENTS RECORDED ({measurements.length})</span>
          {measurements.length > 0 && (
            <button
              onClick={onClear}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {measurements.length === 0 ? (
          <div className="p-3 rounded-lg bg-geo-bg border border-geo-border text-center text-[11px] text-geo-muted font-mono">
            Click on 3D terrain surface to place measurement pins
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs">
            {measurements.map(m => (
              <div 
                key={m.id}
                className="p-2 rounded bg-geo-bg border border-geo-border flex items-center justify-between"
              >
                <div>
                  <span className="text-geo-muted text-[10px] block uppercase">{m.label}</span>
                  <span className="text-geo-primary font-bold text-sm">{m.value} {m.unit}</span>
                </div>
                <span className="text-[10px] text-geo-muted bg-white px-1.5 py-0.5 rounded border border-geo-border">
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
