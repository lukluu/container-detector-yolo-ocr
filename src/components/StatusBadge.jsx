import React from 'react';

const StatusBadge = ({ status, text }) => {
  const variants = {
    idle: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    connecting: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20 animate-pulse',
    active: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    error: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };

  const dots = {
    idle: 'bg-slate-400 dark:bg-slate-500',
    connecting: 'bg-yellow-500',
    active: 'bg-cyan-500 dark:bg-cyan-400 animate-ping',
    done: 'bg-emerald-500 dark:bg-emerald-400',
    error: 'bg-red-500',
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium tracking-wide ${variants[status] || variants.idle}`}>
      <span className="relative flex h-2 w-2 mr-2">
        {status === 'active' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 dark:bg-cyan-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dots[status] || dots.idle}`}></span>
      </span>
      {text || status.toUpperCase()}
    </div>
  );
};

export default StatusBadge;
