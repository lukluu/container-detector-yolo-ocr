import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, HelpCircle, X } from 'lucide-react';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
  const [dialogs, setDialogs] = useState([]);

  // type: 'alert' | 'confirm'
  // style: 'info' | 'success' | 'error' | 'warning'
  const showDialog = useCallback((options) => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      setDialogs((prev) => [
        ...prev,
        { id, ...options, resolve },
      ]);
    });
  }, []);

  const showAlert = (title, message, style = 'info') => {
    return showDialog({ type: 'alert', title, message, style });
  };

  const showConfirm = (title, message, style = 'warning') => {
    return showDialog({ type: 'confirm', title, message, style });
  };

  const handleClose = (id, result) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog) dialog.resolve(result);
      return prev.filter((d) => d.id !== id);
    });
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {dialogs.map((dialog) => (
          <DialogModal key={dialog.id} dialog={dialog} onClose={handleClose} />
        ))}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};

const DialogModal = ({ dialog, onClose }) => {
  const { id, type, title, message, style } = dialog;

  const styles = {
    info: { icon: <Info className="text-blue-600 dark:text-blue-400" size={32}/>, bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    success: { icon: <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={32}/>, bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    error: { icon: <AlertCircle className="text-red-600 dark:text-red-400" size={32}/>, bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20', btn: 'bg-red-600 hover:bg-red-700 text-white' },
    warning: { icon: <HelpCircle className="text-yellow-600 dark:text-yellow-400" size={32}/>, bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20', btn: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
  };

  const currentStyle = styles[style] || styles.info;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden relative"
      >
        <button 
          onClick={() => onClose(id, false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className={`p-6 ${currentStyle.bg} ${currentStyle.border} border-b flex flex-col items-center text-center gap-4`}>
          <div className="p-3 bg-white dark:bg-white/5 rounded-full shadow-sm border border-slate-200 dark:border-white/10">
            {currentStyle.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">{message}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800">
          {type === 'confirm' && (
            <button 
              onClick={() => onClose(id, false)}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 transition-colors shadow-sm"
            >
              Batal
            </button>
          )}
          <button 
            onClick={() => onClose(id, true)}
            className={`px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors ${currentStyle.btn}`}
          >
            {type === 'confirm' ? 'Ya, Lanjutkan' : 'Oke, Mengerti'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
