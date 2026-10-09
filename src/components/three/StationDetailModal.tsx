import React from 'react';
import { MonitoringStation } from '../../types';
import { 
  X, 
  Activity, 
  Thermometer, 
  Droplets, 
  Mountain, 
  Wifi, 
  BatteryCharging, 
  Crosshair,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

interface StationDetailModalProps {
  station: MonitoringStation;
  onClose: () => void;
  onFocusStation: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onFocusStation,
}) => {
  const isWarning = station.status === 'WARNING';

  return (
    <div className="absolute top-16 left-4 sm:left-6 z-30 w-84 sm:w-96 rounded-xl bg-space-900/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden animate-fade-in font-sans">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-space-850 to-space-800 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white tracking-wide">{station.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {station.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[190px]">{station.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFocusStation}
            title="Recenter Camera on Station"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-space-700 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Specs List - Matches Exact Prompt Requirements */}
      <div className="p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Station ID */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Station ID</span>
            <span className="text-sm font-bold text-cyan-300">{station.id}</span>
          </div>

          {/* Location */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Location</span>
            <span className="text-sm font-bold text-white truncate">{station.zone}</span>
          </div>

          {/* Elevation */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Mountain className="w-3 h-3 text-cyan-400" />
              <span>Elevation</span>
            </div>
            <span className="text-sm font-bold text-white">{station.elevation} m</span>
          </div>

          {/* Temperature */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Thermometer className={`w-3 h-3 ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>Temperature</span>
            </div>
            <span className={`text-sm font-bold ${isWarning ? 'text-amber-300' : 'text-white'}`}>
              {station.temperature.toFixed(1)}°C
            </span>
          </div>

          {/* Data Quality */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Data Quality</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{station.dataQuality}%</span>
          </div>

          {/* Status */}
          <div className="p-2.5 rounded-lg bg-space-850/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Status</span>
            </div>
            <span className={`text-sm font-bold ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {station.status}
            </span>
          </div>
        </div>

        {/* Secondary Telemetry Details */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>{station.humidity}% RH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>{station.signalStrength} dBm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{station.battery}%</span>
          </div>
        </div>

        {/* Mini Telemetry Sparkline */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>LIVE THERMAL FLUX (PAST 30 MIN)</span>
            <span className="text-cyan-400">{station.lastUpdate}</span>
          </div>
          <div className="h-16 w-full rounded bg-space-950/60 border border-slate-800 p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={station.telemetryHistory}>
                <defs>
                  <linearGradient id={`grad-${station.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', fontSize: '11px' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#00f0ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#grad-${station.id})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onFocusStation}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-medium text-xs flex items-center justify-center gap-2 transition shadow-neon-cyan"
          >
            <Crosshair className="w-4 h-4" />
            <span>Recenter 3D Digital Twin on {station.id}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationDetailModal;
