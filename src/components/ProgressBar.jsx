import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ percent, frame, total, text }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 dark:text-slate-400">{text || 'Processing...'}</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-medium">
          {percent}% {frame > 0 && total > 0 && `(${frame}/${total})`}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-cyan-600 dark:bg-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
