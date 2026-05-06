import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch, Image as ImageIcon } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { useTheme } from '../components/ThemeProvider';

const DetectionTable = ({ detections }) => {
  const [lightboxImg, setLightboxImg] = useState(null);
  const { theme } = useTheme();
  
  // Animation background colors based on theme
  const highlightColor = theme === 'dark' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(6, 182, 212, 0.15)'; // cyan-400 vs cyan-500

  return (
    <div className="card-minimal rounded-2xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
        <PackageSearch className="text-cyan-600 dark:text-cyan-400" />
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Live Detections</h3>
        <span className="ml-auto bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 py-1 px-3 rounded-full text-xs font-bold">
          {detections.length} Total
        </span>
      </div>

      <div className="flex-grow overflow-auto p-2">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 text-slate-500 dark:text-slate-400 shadow-sm">
            <tr>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">ID Deteksi</th>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">NK</th>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">ISO</th>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">Crop NK & ISO</th>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">Waktu Video</th>
              <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <AnimatePresence>
              {detections.map((det) => (
                <motion.tr 
                  key={det.id}
                  initial={{ opacity: 0, y: -20, backgroundColor: highlightColor }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group transition-colors"
                >
                  <td className="p-3 font-mono text-slate-500">#{det.id}</td>
                  <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">{det.nk || '-'}</td>
                  <td className="p-3 font-bold text-violet-600 dark:text-violet-400">{det.iso || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {det.img_nk ? (
                        <button 
                          onClick={() => setLightboxImg(det.img_nk)}
                          className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer relative"
                        >
                          <img src={det.img_nk} className="w-full h-full object-cover" alt="NK Crop" />
                        </button>
                      ) : (
                        <div className="w-14 h-8 bg-slate-100 dark:bg-slate-800/50 rounded flex items-center justify-center text-slate-400 dark:text-slate-600"><ImageIcon size={14}/></div>
                      )}
                      
                      {det.img_iso ? (
                        <button 
                          onClick={() => setLightboxImg(det.img_iso)}
                          className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer"
                        >
                          <img src={det.img_iso} className="w-full h-full object-cover" alt="ISO Crop" />
                        </button>
                      ) : (
                        <div className="w-14 h-8 bg-slate-100 dark:bg-slate-800/50 rounded flex items-center justify-center text-slate-400 dark:text-slate-600"><ImageIcon size={14}/></div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-xs">
                    Frame {det.video_time}
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-xs text-right">
                    {det.timestamp}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {detections.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  Waiting for detections...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
    </div>
  );
};

export default DetectionTable;
