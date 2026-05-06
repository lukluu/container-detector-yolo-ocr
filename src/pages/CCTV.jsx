import React, { useState, useEffect } from 'react';
import { Camera, StopCircle, Link } from 'lucide-react';
import { connectCamera, stopSession, saveSessionToDB } from '../services/api';
import { useSSE } from '../hooks/useSSE';
import { useDialog } from '../components/DialogProvider';
import DetectionStream from '../components/DetectionStream';
import DetectionTable from '../components/DetectionTable';

const CCTV = () => {
  const [url, setUrl] = useState('rtsp://your_camera_ip/stream');
  const [sessionId, setSessionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { detections, status, statusMessage } = useSSE(sessionId);
  const { showAlert } = useDialog();

  useEffect(() => {
    if ((status === 'done' || status === 'error') && sessionId) {
      saveSessionToDB({
        session_id: sessionId,
        source: 'cctv',
        file_name: url,
        total_containers: detections.length,
        result_url: null,
        detections: detections
      }).catch(console.error);
    }
  }, [status, sessionId, detections, url]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!url) return;
    setIsConnecting(true);
    try {
      const res = await connectCamera(url);
      setSessionId(res.session_id);
    } catch (err) {
      console.error(err);
      showAlert('Koneksi Gagal', 'Gagal terhubung ke stream CCTV. Pastikan URL benar dan kamera aktif.', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStop = async () => {
    if (sessionId) {
      try {
        await stopSession(sessionId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">IP Camera (CCTV)</h1>
        <p className="text-slate-500">Connect to an RTSP stream for real-time detection</p>
      </header>

      <div className="flex flex-col gap-6 flex-grow min-h-0">
        <div className="flex flex-col gap-6">
          
          <div className="card-minimal p-6">
            {!sessionId || status === 'done' || status === 'error' ? (
              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full input-minimal pl-12 pr-4 py-4"
                    placeholder="rtsp://admin:password@192.168.1.100:554/stream"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!url || isConnecting}
                  className="px-8 py-4 btn-primary"
                >
                  <Camera size={20} />
                  {isConnecting ? 'Connecting...' : 'Connect Stream'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                    <Camera className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-cyan-600 dark:text-cyan-400">Monitoring CCTV</h3>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-xs">{url}</p>
                  </div>
                </div>
                <button 
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors border border-red-200 dark:border-red-500/20"
                >
                  <StopCircle size={20} /> Stop Monitoring
                </button>
              </div>
            )}
          </div>

          <div className="card-minimal p-6 flex flex-col">
            <DetectionStream 
              sessionId={sessionId} 
              status={status} 
              statusMessage={statusMessage} 
              title="RTSP Live Feed"
            />
          </div>

        </div>

        <div className="min-h-[400px]">
          <DetectionTable detections={detections} />
        </div>
      </div>
    </div>
  );
};

export default CCTV;
