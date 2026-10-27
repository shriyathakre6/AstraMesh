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
    <div className="absolute top-16 left-4 sm:left-6 z-30 w-84 sm:w-96 rounded-xl bg-white border border-geo-border shadow-geo-xl overflow-hidden animate-fade-in font-sans">
      {/* Header */}
      <div className="p-4 bg-geo-blue-light border-b border-geo-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-geo-primary tracking-wide">{station.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {station.status}
              </span>
            </div>
            <p className="text-xs text-geo-muted font-medium truncate max-w-[190px]">{station.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFocusStation}
            title="Recenter Camera on Station"
            className="p-1.5 rounded-lg text-geo-muted hover:text-geo-primary hover:bg-white transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-geo-muted hover:text-geo-text hover:bg-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Specs List - Matches Exact Prompt Requirements */}
      <div className="p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Station ID */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <span className="text-[10px] text-geo-muted uppercase tracking-wider">Station ID</span>
            <span className="text-sm font-bold text-geo-primary">{station.id}</span>
          </div>

          {/* Location */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <span className="text-[10px] text-geo-muted uppercase tracking-wider">Location</span>
            <span className="text-sm font-bold text-geo-text truncate">{station.zone}</span>
          </div>

          {/* Elevation */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-geo-muted uppercase tracking-wider">
              <Mountain className="w-3 h-3 text-geo-teal" />
              <span>Elevation</span>
            </div>
            <span className="text-sm font-bold text-geo-text">{station.elevation} m</span>
          </div>

          {/* Temperature */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-geo-muted uppercase tracking-wider">
              <Thermometer className={`w-3 h-3 ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
              <span>Temperature</span>
            </div>
            <span className={`text-sm font-bold ${isWarning ? 'text-amber-700' : 'text-geo-text'}`}>
              {station.temperature.toFixed(1)}°C
            </span>
          </div>

          {/* Data Quality */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-geo-muted uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-geo-teal" />
              <span>Data Quality</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{station.dataQuality}%</span>
          </div>

          {/* Status */}
          <div className="p-2.5 rounded-lg bg-geo-bg border border-geo-border flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] text-geo-muted uppercase tracking-wider">
              <Activity className="w-3 h-3 text-geo-primary" />
              <span>Status</span>
            </div>
            <span className={`text-sm font-bold ${isWarning ? 'text-amber-700' : 'text-emerald-600'}`}>
              {station.status}
            </span>
          </div>
        </div>

        {/* Secondary Telemetry Details */}
        <div className="pt-2 border-t border-geo-border grid grid-cols-3 gap-2 text-[11px] text-geo-muted">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-geo-secondary" />
            <span>{station.humidity}% RH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-geo-teal" />
            <span>{station.signalStrength} dBm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>{station.battery}%</span>
          </div>
        </div>

        {/* Mini Telemetry Sparkline */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] text-geo-muted mb-1">
            <span>LIVE THERMAL FLUX (PAST 30 MIN)</span>
            <span className="text-geo-teal font-semibold">{station.lastUpdate}</span>
          </div>
          <div className="h-16 w-full rounded bg-geo-bg border border-geo-border p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={station.telemetryHistory}>
                <defs>
                  <linearGradient id={`grad-${station.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234A72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#234A72" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E1E7EF', fontSize: '11px', color: '#1D2939' }}
                  itemStyle={{ color: '#234A72' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#234A72" 
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
            className="w-full py-2 px-3 rounded-lg bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-geo-primary font-bold text-xs flex items-center justify-center gap-2 transition shadow-geo-sm"
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
