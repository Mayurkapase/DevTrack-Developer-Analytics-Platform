import React from 'react';

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  noPadding = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-[#111827]/70 backdrop-blur-md transition-colors hover:border-slate-700/80 ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-center justify-between px-6 py-4 ${
            headerBorder ? 'border-b border-slate-800/60' : ''
          }`}
        >
          <div>
            {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
