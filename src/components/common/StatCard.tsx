import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  onClick,
}) => {
  const colorMap = {
    cyan: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/60',
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400/60',
    amber: 'from-amber-500/10 to-orange-500/5 border-amber-500/30 text-amber-400 group-hover:border-amber-400/60',
    rose: 'from-rose-500/10 to-red-500/5 border-rose-500/30 text-rose-400 group-hover:border-rose-400/60',
    blue: 'from-blue-500/10 to-indigo-500/5 border-blue-500/30 text-blue-400 group-hover:border-blue-400/60',
  };

  const iconBgMap = {
    cyan: 'bg-cyan-500/15 text-cyan-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    rose: 'bg-rose-500/15 text-rose-400',
    blue: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl bg-gradient-to-b ${colorMap[color]} bg-space-900/70 backdrop-blur-md border shadow-glass transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-medium">
            {title}
          </span>
          <div className="text-3xl font-extrabold text-white mt-1 tracking-tight font-sans">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${iconBgMap[color]} transition-transform group-hover:scale-110 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        {trend ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {trend.direction === 'up' && (
              <span className="flex items-center text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center text-rose-400 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="flex items-center text-slate-400 font-semibold">
                <Minus className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            <span className="text-slate-400">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">{subtitle || 'Nominal telemetry stream'}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
