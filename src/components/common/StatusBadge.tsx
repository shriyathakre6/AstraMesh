import React from 'react';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'CACHED' | 'SYNCHRONIZING' | 'LOW' | 'MODERATE' | 'HIGH' | 'INFO';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const styles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    OFFLINE: 'bg-slate-100 text-slate-600 border-slate-200',
    CACHED: 'bg-geo-blue-light text-geo-primary border-geo-border',
    SYNCHRONIZING: 'bg-geo-mint-light text-geo-teal border-geo-teal/30',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MODERATE: 'bg-geo-blue-light text-geo-primary border-geo-border',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    INFO: 'bg-geo-blue-light text-geo-primary border-geo-border',
  };

  const dotColors = {
    ACTIVE: 'bg-emerald-500',
    WARNING: 'bg-amber-500',
    CRITICAL: 'bg-rose-500',
    OFFLINE: 'bg-slate-400',
    CACHED: 'bg-geo-primary',
    SYNCHRONIZING: 'bg-geo-teal',
    LOW: 'bg-emerald-500',
    MODERATE: 'bg-geo-secondary',
    HIGH: 'bg-amber-500',
    INFO: 'bg-geo-teal',
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
