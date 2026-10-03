import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-4">
      <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      <span className="text-sm font-medium text-slate-400">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
