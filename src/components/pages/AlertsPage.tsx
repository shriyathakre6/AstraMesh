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
        return <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-geo-teal" />;
    }
  };

  const getCardBorder = (sev: AlertItem['severity'], acknowledged: boolean) => {
    if (acknowledged) return 'border-geo-border bg-geo-bg opacity-70';
    switch (sev) {
      case 'CRITICAL':
        return 'border-rose-300 bg-rose-50/50 shadow-geo-sm';
      case 'WARNING':
        return 'border-amber-300 bg-amber-50/50 shadow-geo-sm';
      case 'INFO':
        return 'border-geo-border bg-white shadow-geo-sm';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-600 uppercase tracking-wider mb-1 font-semibold">
            <Bell className="w-3.5 h-3.5 animate-pulse" />
            <span>Automated Spatial Incident Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Intelligent Alert Center
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Prioritized real-time spatial anomalies detected via multi-layer sensor correlation.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-geo-border shadow-geo-sm">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterSeverity === sev
                  ? 'bg-geo-blue-light text-geo-primary border border-geo-border font-bold'
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all duration-200 ${getCardBorder(
              alert.severity,
              alert.acknowledged
            )}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-geo-border shadow-geo-sm mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-geo-primary">{alert.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-geo-blue-light text-geo-primary'
                    }`}>
                      {alert.severity}
                    </span>
                    <h3 className="text-sm font-bold text-geo-text-main">{alert.title}</h3>
                  </div>

                  <p className="text-xs text-geo-text-main mt-1 leading-relaxed max-w-2xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-geo-text-sub flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-geo-teal" />
                      <span>{alert.location}</span>
                    </span>
                    <span className="text-geo-border">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-geo-text-muted" />
                      <span>{alert.timestamp}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-geo-blue-light border border-geo-border text-geo-primary text-xs font-semibold shadow-geo-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledged</span>
                  </span>
                )}

                <button
                  onClick={() => handleViewIn3D(alert)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white text-xs font-bold shadow-geo-sm transition"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspect in 3D</span>
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
