import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MonitoringStation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DigitalTwinCanvas } from '../three/DigitalTwinCanvas';
import { 
  Activity, 
  Radio, 
  Thermometer, 
  Droplets, 
  Mountain, 
  Wifi, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Filter, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  Pause,
  Box,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const MonitoringPage: React.FC = () => {
  const { 
    stations, 
    viewStationIn3D, 
    liveStreaming, 
    toggleLiveStreaming, 
    setSelectedStation 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'WARNING' | 'OFFLINE'>('ALL');
  const [selectedStationId, setSelectedStationId] = useState<string>('AST-04');

  const filteredStations = stations.filter(st => {
    if (filterStatus === 'ALL') return true;
    return st.status === filterStatus;
  });

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[3];

  // Data for Chart 1: Live Temperature Streaming
  const liveTempChartData = [
    { time: '14:00', 'AST-01': 26.4, 'AST-03': 28.1, 'AST-04': 28.0, 'AST-07': 30.2 },
    { time: '14:10', 'AST-01': 26.5, 'AST-03': 28.5, 'AST-04': 28.2, 'AST-07': 30.7 },
    { time: '14:20', 'AST-01': 26.7, 'AST-03': 28.9, 'AST-04': 28.3, 'AST-07': 31.1 },
    { time: '14:30', 'AST-01': 26.8, 'AST-03': 29.2, 'AST-04': 28.4, 'AST-07': 31.4 },
  ];

  // Data for Chart 2: Environmental Index (NDVI, Soil Moisture, Canopy Temp)
  const envIndexData = [
    { time: '10:00', ndvi: 0.62, soilMoisture: 42, vaporDeficit: 1.2 },
    { time: '11:00', ndvi: 0.61, soilMoisture: 41, vaporDeficit: 1.4 },
    { time: '12:00', ndvi: 0.58, soilMoisture: 39, vaporDeficit: 1.8 },
    { time: '13:00', ndvi: 0.55, soilMoisture: 36, vaporDeficit: 2.1 },
    { time: '14:00', ndvi: 0.52, soilMoisture: 35, vaporDeficit: 2.3 },
    { time: '15:00', ndvi: 0.49, soilMoisture: 33, vaporDeficit: 2.5 },
  ];

  // Data for Chart 3: Signal Strength (dBm telemetry)
  const signalStrengthData = stations.map(s => ({
    station: s.id,
    signal: s.signalStrength,
    battery: s.battery,
  }));

  // Data for Chart 4: Station Activity / Packet Throughput
  const stationActivityData = stations.map(s => ({
    station: s.id,
    packetsPerMin: s.status === 'ACTIVE' ? Math.round(180 + Math.random() * 40) : Math.round(90 + Math.random() * 30),
    dataQuality: s.dataQuality,
  }));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>In-Situ IoT Telemetry Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Environmental Monitoring Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time telemetry streams from 8 edge monitoring pods across 4 geomorphological zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLiveStreaming}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
              liveStreaming
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                : 'bg-space-900 text-slate-400 border border-slate-700'
            }`}
          >
            {liveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{liveStreaming ? 'STREAMING ACTIVE (3s)' : 'STREAMING PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* 8 Monitoring Stations Grid (Exact Mock Data Display) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Ground Telemetry Nodes ({filteredStations.length})</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {(['ALL', 'ACTIVE', 'WARNING'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded transition ${
                  filterStatus === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-space-850'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Station Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStations.map(station => {
            const isWarning = station.status === 'WARNING';
            const isSelected = selectedStationId === station.id;

            return (
              <div
                key={station.id}
                onClick={() => setSelectedStationId(station.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 bg-space-900/80 backdrop-blur-md relative ${
                  isSelected
                    ? 'border-cyan-400 shadow-neon-cyan'
                    : isWarning
                    ? 'border-amber-500/30 hover:border-amber-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Station ID & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-cyan-300">
                      {station.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">
                      {station.zone}
                    </span>
                  </div>
                  <StatusBadge status={station.status} size="sm" />
                </div>

                <div className="text-xs text-slate-200 font-semibold truncate mb-3">
                  {station.name}
                </div>

                {/* Exact Metrics Specified in Prompt */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Temperature</span>
                    <span className={`font-bold ${isWarning ? 'text-amber-300' : 'text-white'}`}>
                      {station.temperature.toFixed(1)}°C
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Humidity</span>
                    <span className="font-bold text-slate-200">{station.humidity}% RH</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Elevation</span>
                    <span className="font-bold text-slate-200">{station.elevation} m</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Signal</span>
                    <span className="font-bold text-cyan-300">{station.signalStrength} dBm</span>
                  </div>
                </div>

                {/* Footer: Last Update & 3D view button */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{station.lastUpdate}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewStationIn3D(station.id);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline font-bold"
                  >
                    <span>3D Twin</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Station Deep Inspector + Spatial Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Station Deep Telemetry (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-cyan-300">{activeStation.id}</span>
                <StatusBadge status={activeStation.status} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeStation.name}</p>
            </div>

            <button
              onClick={() => viewStationIn3D(activeStation.id)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Inspect in 3D</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Data Quality</span>
              <span className="text-base font-bold text-emerald-400">{activeStation.dataQuality}%</span>
            </div>
            <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Battery Level</span>
              <span className="text-base font-bold text-cyan-300">{activeStation.battery}%</span>
            </div>
            <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Geo Latitude</span>
              <span className="text-base font-bold text-white">{activeStation.geoCoords.lat}°N</span>
            </div>
          </div>

          {/* Sparkline for Station */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Temperature History (AST-04 Micro-Sensor)
            </span>
            <div className="h-40 w-full rounded-xl bg-space-950/70 border border-slate-800 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeStation.telemetryHistory}>
                  <defs>
                    <linearGradient id="stationAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#00f0ff" strokeWidth={2} fill="url(#stationAreaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Miniature 3D Spatial Grid (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass overflow-hidden flex flex-col h-[340px]">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-space-850/60">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Spatial Sensor Placement (3D Topo Model)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">8 NODES ONLINE</span>
          </div>

          <div className="flex-1 relative w-full h-full min-h-0">
            <DigitalTwinCanvas isMiniPreview={true} />
          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Live Recharts Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Temperature */}
        <div className="p-4 rounded-xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white">Temperature Feed</h4>
              <p className="text-[10px] text-slate-400">Multi-station thermal trend (°C)</p>
            </div>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveTempChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} domain={[24, 33]} />
                <Tooltip contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', fontSize: '10px' }} />
                <Line type="monotone" dataKey="AST-04" stroke="#00f0ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="AST-07" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Environmental Index */}
        <div className="p-4 rounded-xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white">Environmental Index</h4>
              <p className="text-[10px] text-slate-400">Soil moisture & canopy flux</p>
            </div>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={envIndexData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', fontSize: '10px' }} />
                <Area type="monotone" dataKey="soilMoisture" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Signal Strength */}
        <div className="p-4 rounded-xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white">Signal Strength</h4>
              <p className="text-[10px] text-slate-400">LoRaWAN uplink dBm</p>
            </div>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalStrengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={8} />
                <YAxis stroke="#64748b" fontSize={9} domain={[-100, -40]} />
                <Tooltip contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', fontSize: '10px' }} />
                <Bar dataKey="signal" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Station Activity */}
        <div className="p-4 rounded-xl bg-space-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white">Activity Rate</h4>
              <p className="text-[10px] text-slate-400">Packets processed / min</p>
            </div>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={8} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#070c18', borderColor: '#334155', fontSize: '10px' }} />
                <Bar dataKey="packetsPerMin" fill="#818cf8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
