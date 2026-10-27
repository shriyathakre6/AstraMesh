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

  const liveTempChartData = [
    { time: '14:00', 'AST-01': 26.4, 'AST-03': 28.1, 'AST-04': 28.0, 'AST-07': 30.2 },
    { time: '14:10', 'AST-01': 26.5, 'AST-03': 28.5, 'AST-04': 28.2, 'AST-07': 30.7 },
    { time: '14:20', 'AST-01': 26.7, 'AST-03': 28.9, 'AST-04': 28.3, 'AST-07': 31.1 },
    { time: '14:30', 'AST-01': 26.8, 'AST-03': 29.2, 'AST-04': 28.4, 'AST-07': 31.4 },
  ];

  const envIndexData = [
    { time: '10:00', ndvi: 0.62, soilMoisture: 42, vaporDeficit: 1.2 },
    { time: '11:00', ndvi: 0.61, soilMoisture: 41, vaporDeficit: 1.4 },
    { time: '12:00', ndvi: 0.58, soilMoisture: 39, vaporDeficit: 1.8 },
    { time: '13:00', ndvi: 0.55, soilMoisture: 36, vaporDeficit: 2.1 },
    { time: '14:00', ndvi: 0.52, soilMoisture: 35, vaporDeficit: 2.3 },
    { time: '15:00', ndvi: 0.49, soilMoisture: 33, vaporDeficit: 2.5 },
  ];

  const signalStrengthData = stations.map(s => ({
    station: s.id,
    signal: s.signalStrength,
    battery: s.battery,
  }));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <Radio className="w-3.5 h-3.5 text-geo-teal animate-pulse" />
            <span>Field Sensor Mesh & IoT Station Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Real-Time Station Monitoring
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Synchronized micro-climate telemetry, seismic transducers, and soil saturation probes across Sector 7.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveStreaming}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow-geo-sm ${
              liveStreaming
                ? 'bg-geo-teal text-white shadow-teal-glow'
                : 'bg-white border border-geo-border text-geo-text-sub hover:bg-geo-bg'
            }`}
          >
            {liveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{liveStreaming ? 'PAUSE TELEMETRY' : 'RESUME TELEMETRY'}</span>
          </button>
        </div>
      </div>

      {/* Filter Strip & Active Stations Summary */}
      <div className="p-4 rounded-2xl bg-white border border-geo-border shadow-geo-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'WARNING', 'OFFLINE'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                filterStatus === st
                  ? 'bg-geo-blue-light text-geo-primary border border-geo-border font-bold'
                  : 'text-geo-text-sub hover:text-geo-text-main hover:bg-geo-bg'
              }`}
            >
              {st} ({st === 'ALL' ? stations.length : stations.filter(s => s.status === st).length})
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-geo-text-sub">
          Active mesh frequency: <strong className="text-geo-teal">868 MHz LoRaWAN (Ch 04)</strong>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Station Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredStations.map(st => {
            const isSelected = selectedStationId === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setSelectedStationId(st.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-geo-blue-light/70 border-geo-primary text-geo-primary shadow-geo-sm'
                    : 'bg-white border-geo-border text-geo-text-main hover:bg-geo-bg/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-geo-primary">{st.id}</span>
                      <StatusBadge status={st.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-geo-text-main mt-0.5">{st.name}</h4>
                    <span className="text-[11px] font-mono text-geo-text-sub">{st.coordinates}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewStationIn3D(st.id);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-geo-border text-geo-primary hover:bg-geo-blue-light transition shadow-geo-sm"
                    title="Focus station in 3D Digital Twin"
                  >
                    <Box className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-geo-border/60 text-xs font-mono">
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">TEMPERATURE</span>
                    <span className="font-bold text-geo-primary">{st.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">HUMIDITY</span>
                    <span className="font-bold text-geo-teal">{st.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-geo-text-sub text-[10px] block">BATTERY</span>
                    <span className="font-bold text-emerald-700">{st.battery}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Active Station Panel & Streaming Charts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-geo-border shadow-geo-sm space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-geo-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-geo-teal">{activeStation.id}</span>
                  <StatusBadge status={activeStation.status} size="sm" />
                </div>
                <h3 className="text-lg font-extrabold text-geo-primary mt-1">
                  {activeStation.name}
                </h3>
                <p className="text-xs text-geo-text-sub mt-0.5">
                  Elevation: {activeStation.elevation}m • Last telemetry packet: {activeStation.lastUpdate}
                </p>
              </div>

              <button
                onClick={() => viewStationIn3D(activeStation.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-bold shadow-geo-sm transition"
              >
                <Box className="w-4 h-4" />
                <span>Locate Station in 3D</span>
              </button>
            </div>

            {/* Live Chart: Temperature Trend */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-geo-primary uppercase">
                  Telemetry Stream (Temperature Trend °C)
                </span>
                <span className="text-[11px] font-mono text-geo-teal font-semibold">5-Minute Polling</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveTempChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E7EF" />
                    <XAxis dataKey="time" stroke="#667085" fontSize={10} tickLine={false} />
                    <YAxis stroke="#667085" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E1E7EF', 
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#1D2939'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="AST-01" stroke="#3F7898" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="AST-03" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="AST-04" stroke="#234A72" strokeWidth={2.5} dot />
                    <Line type="monotone" dataKey="AST-07" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signal & Battery Chart */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold text-geo-primary uppercase block mb-2">
                Node Battery & LoRa Signal Strength (dBm)
              </span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={signalStrengthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E7EF" />
                    <XAxis dataKey="station" stroke="#667085" fontSize={10} tickLine={false} />
                    <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E1E7EF', 
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#1D2939'
                      }} 
                    />
                    <Bar dataKey="battery" fill="#368A83" radius={[4, 4, 0, 0]} name="Battery %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
