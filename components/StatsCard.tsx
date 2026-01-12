import React from 'react';
import { MetricCardProps } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp, icon, description }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-soft border border-slate-200/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-36 group hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          {icon}
        </div>
        {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
            </div>
        )}
      </div>
      
      <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">{value}</h3>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default StatsCard;