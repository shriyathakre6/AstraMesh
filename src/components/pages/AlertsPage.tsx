import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  Box, 
  Layers, 
  Clock, 
  MapPin, 
  Check, 
  Filter,
  Sparkles
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, viewZoneIn3D, viewStationIn3D } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity === filterSeverity;
  });

  const handleViewIn3D = (alert: AlertItem) => {
    if (alert.zoneId) {
      viewZoneIn3D(alert.zoneId);
    } else if (alert.stationId) {
      viewStationIn3D(alert.stationId);
    } else {
      viewZoneIn3D('zone-alpha');
    }
  };

  const getSeverityIcon = (sev: AlertItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getCardBorder = (sev: AlertItem['severity'], acknowledged: boolean) => {
    if (acknowledged) return 'border-slate-800 bg-space-900/40 opacity-70';
    switch (sev) {
      case 'CRITICAL':
        return 'border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-space-900 to-space-900 shadow-neon-red';
      case 'WARNING':
        return 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-space-900 to-space-900 shadow-neon-amber';
      case 'INFO':
        return 'border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-space-900 to-space-900';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5 animate-pulse" />
            <span>Automated Spatial Incident Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Intelligent Alert Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Prioritized real-time spatial anomalies detected via multi-layer sensor correlation.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-900 border border-slate-800 font-mono text-xs">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-space-850'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-rose-400 uppercase tracking-wider block">
              Critical Anomalies
            </span>
            <span className="text-2xl font-black text-rose-300 font-mono">
              0{alerts.filter(a => a.severity === 'CRITICAL').length}
            </span>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500/60" />
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              Telemetry Warnings
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono">
              0{alerts.filter(a => a.severity === 'WARNING').length}
            </span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/60" />
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
              Processed Datasets
            </span>
            <span className="text-2xl font-black text-cyan-300 font-mono">
              0{alerts.filter(a => a.severity === 'INFO').length}
            </span>
          </div>
          <Info className="w-8 h-8 text-cyan-500/60" />
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all duration-300 ${getCardBorder(
              alert.severity,
              alert.acknowledged
            )}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Details */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800 flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alert.timestamp}</span>
                    </span>
                    {alert.acknowledged && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-xs font-mono text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{alert.location}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Affected Layer: <strong className="text-cyan-300">{alert.affectedLayer}</strong></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0 self-end lg:self-center">
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {/* The Crucial "View in 3D" Button */}
                <button
                  onClick={() => handleViewIn3D(alert)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan flex items-center gap-2 transition"
                >
                  <Box className="w-4 h-4" />
                  <span>View in 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
