import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Eye, EyeOff, Sliders } from 'lucide-react';

interface LayerControlOverlayProps {
  onClose: () => void;
}

export const LayerControlOverlay: React.FC<LayerControlOverlayProps> = ({ onClose }) => {
  const { dataLayers, toggleLayer, setLayerOpacity } = useApp();

  return (
    <div className="rounded-xl bg-white border border-geo-border shadow-geo-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3.5 bg-geo-blue-light border-b border-geo-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-geo-primary" />
          <span className="text-xs font-semibold text-geo-primary uppercase tracking-wider">
            3D Layer Controller ({dataLayers.filter(l => l.active).length}/{dataLayers.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-geo-muted hover:text-geo-text hover:bg-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List */}
      <div className="p-3 max-h-96 overflow-y-auto space-y-2.5 divide-y divide-geo-border">
        {dataLayers.map(layer => (
          <div key={layer.id} className="pt-2.5 first:pt-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-1 rounded transition ${
                    layer.active ? 'text-geo-primary bg-geo-blue-light' : 'text-geo-muted hover:text-geo-text'
                  }`}
                  title={layer.active ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${layer.active ? 'text-geo-text' : 'text-geo-muted'}`}>
                    {layer.name}
                  </span>
                  <span className="text-[10px] font-mono text-geo-muted">{layer.dataSource}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                layer.status === 'ACTIVE' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : layer.status === 'SYNCHRONIZING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : 'bg-geo-bg text-geo-muted border border-geo-border'
              }`}>
                {layer.status}
              </span>
            </div>

            {/* Opacity Slider (when active) */}
            {layer.active && (
              <div className="flex items-center gap-2 pl-6 pr-1">
                <Sliders className="w-3 h-3 text-geo-muted" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-geo-border rounded-lg appearance-none cursor-pointer accent-geo-primary"
                />
                <span className="text-[10px] font-mono text-geo-primary font-bold w-8 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-geo-bg border-t border-geo-border text-center">
        <p className="text-[10px] text-geo-muted font-mono">
          GPU Real-Time Composite Shader | VSync ON
        </p>
      </div>
    </div>
  );
};

export default LayerControlOverlay;
