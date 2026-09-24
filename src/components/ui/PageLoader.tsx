import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-4">
    <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 rounded-full animate-spin" />
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 animate-pulse">
      Loading view...
    </span>
  </div>
);
