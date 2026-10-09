import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Eye, EyeOff, Sliders } from 'lucide-react';

interface LayerControlOverlayProps {
  onClose: () => void;
}

export const LayerControlOverlay: React.FC<LayerControlOverlayProps> = ({ onClose }) => {
  const { dataLayers, toggleLayer, setLayerOpacity } = useApp();

  return (
    <div className="rounded-xl bg-space-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-space-850 to-space-800 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            3D Layer Controller ({dataLayers.filter(l => l.active).length}/{dataLayers.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List */}
      <div className="p-3 max-h-96 overflow-y-auto space-y-2.5 divide-y divide-slate-800/80">
        {dataLayers.map(layer => (
          <div key={layer.id} className="pt-2.5 first:pt-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-1 rounded transition ${
                    layer.active ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={layer.active ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${layer.active ? 'text-slate-100' : 'text-slate-500'}`}>
                    {layer.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{layer.dataSource}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                layer.status === 'ACTIVE' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : layer.status === 'SYNCHRONIZING'
                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {layer.status}
              </span>
            </div>

            {/* Opacity Slider (when active) */}
            {layer.active && (
              <div className="flex items-center gap-2 pl-6 pr-1">
                <Sliders className="w-3 h-3 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-space-950/80 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-400 font-mono">
          GPU Real-Time Composite Shader | VSync ON
        </p>
      </div>
    </div>
  );
};

export default LayerControlOverlay;
