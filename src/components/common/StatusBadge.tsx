import React from 'react';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'CACHED' | 'SYNCHRONIZING' | 'LOW' | 'MODERATE' | 'HIGH' | 'INFO';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const styles = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    WARNING: 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse',
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    OFFLINE: 'bg-slate-800 text-slate-400 border-slate-700',
    CACHED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    SYNCHRONIZING: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 animate-pulse',
    LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    MODERATE: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    INFO: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  };

  const dotColors = {
    ACTIVE: 'bg-emerald-400',
    WARNING: 'bg-amber-400',
    CRITICAL: 'bg-rose-400',
    OFFLINE: 'bg-slate-500',
    CACHED: 'bg-blue-400',
    SYNCHRONIZING: 'bg-cyan-400',
    LOW: 'bg-emerald-400',
    MODERATE: 'bg-cyan-400',
    HIGH: 'bg-orange-400',
    INFO: 'bg-cyan-400',
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold tracking-wider uppercase border ${styles[status] || styles.OFFLINE} ${sizeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || 'bg-slate-400'}`} />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
