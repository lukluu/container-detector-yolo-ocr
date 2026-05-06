import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        >
          <motion.img 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            src={src} 
            alt={alt || "Crop view"} 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
