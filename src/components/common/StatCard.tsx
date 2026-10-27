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
  const iconStyleMap = {
    cyan: 'bg-geo-mint-light text-geo-teal border-geo-teal/30',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    blue: 'bg-geo-blue-light text-geo-primary border-geo-primary/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm hover:shadow-geo-md transition-all duration-200 group ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-geo-text-sub font-semibold">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-geo-primary mt-1 tracking-tight font-sans">
            {value}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${iconStyleMap[color]} transition-transform group-hover:scale-105 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-geo-border">
        {trend ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {trend.direction === 'up' && (
              <span className="flex items-center text-emerald-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center text-rose-600 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="flex items-center text-geo-text-sub font-medium">
                <Minus className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            <span className="text-geo-text-sub">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[11px] text-geo-text-sub">{subtitle || 'Nominal telemetry stream'}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
