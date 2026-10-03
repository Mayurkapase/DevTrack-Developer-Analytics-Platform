import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'brand', trend, onClick }) => {
  const colorMap = {
    brand: 'from-brand-500/15 to-indigo-500/5 text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/15 to-orange-500/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/15 to-fuchsia-500/5 text-purple-400 border-purple-500/20',
    blue: 'from-blue-500/15 to-cyan-500/5 text-blue-400 border-blue-500/20',
    rose: 'from-rose-500/15 to-pink-500/5 text-rose-400 border-rose-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.brand;

  return (
    <div 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`relative overflow-hidden rounded-2xl p-5 border bg-[#111827]/80 backdrop-blur-md transition-all duration-200 hover:border-gray-700 hover:shadow-xl hover:shadow-black/40 ${selectedColor} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] group' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
