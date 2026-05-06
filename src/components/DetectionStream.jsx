import React from 'react';
import StatusBadge from './StatusBadge';
import { CameraOff, Loader2 } from 'lucide-react';

const DetectionStream = ({ sessionId, status, statusMessage, title, resultUrl }) => {
  const streamUrl = sessionId ? `/api/stream/${sessionId}?t=${Date.now()}` : null;
  const isStreaming = status === 'active';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title || 'Live Feed'}</h2>
        <StatusBadge status={status} text={statusMessage} />
      </div>

      <div className="relative flex-grow bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center min-h-[300px] shadow-sm">
        {!sessionId && status === 'idle' && (
          <div className="text-center text-slate-400 dark:text-slate-500">
            <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active stream</p>
          </div>
        )}

        {status === 'connecting' && (
          <div className="text-center text-cyan-600 dark:text-cyan-500">
            <Loader2 className="w-10 h-10 mx-auto animate-spin mb-3" />
            <p>Connecting to stream...</p>
          </div>
        )}

        {status === 'error' && !resultUrl && (
          <div className="text-center text-red-500">
            <CameraOff className="w-12 h-12 mx-auto mb-3" />
            <p>Stream disconnected or failed</p>
          </div>
        )}

        {/* Jika proses selesai dan ada URL hasil video, tampilkan Video Player */}
        {(status === 'done' || (status === 'error' && resultUrl)) && resultUrl ? (
          <video 
            src={resultUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain bg-black"
          >
            Browser Anda tidak mendukung video HTML5.
          </video>
        ) : status === 'done' ? (
          <div className="text-center text-slate-400 dark:text-slate-500">
            <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Monitoring Stopped</p>
          </div>
        ) : (
          /* Tampilkan Stream MJPEG saat masih aktif */
          streamUrl && isStreaming && (
            <img 
              src={streamUrl} 
              alt="Detection Stream" 
              className="w-full h-full object-contain"
              key={sessionId} 
            />
          )
        )}
      </div>
    </div>
  );
};

export default DetectionStream;
