import React, { useState, useEffect } from 'react';
import { Webcam as WebcamIcon, StopCircle, Usb } from 'lucide-react';
import { connectWebcam, stopSession, saveSessionToDB } from '../services/api';
import { useSSE } from '../hooks/useSSE';
import { useDialog } from '../components/DialogProvider';
import DetectionStream from '../components/DetectionStream';
import DetectionTable from '../components/DetectionTable';

const Webcam = () => {
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { detections, status, statusMessage } = useSSE(sessionId);
  const { showAlert } = useDialog();

  useEffect(() => {
    if ((status === 'done' || status === 'error') && sessionId) {
      saveSessionToDB({
        session_id: sessionId,
        source: 'webcam',
        file_name: `USB Camera ${deviceIndex}`,
        total_containers: detections.length,
        result_url: null,
        detections: detections
      }).catch(console.error);
    }
  }, [status, sessionId, detections, deviceIndex]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await connectWebcam(deviceIndex);
      setSessionId(res.session_id);
    } catch (err) {
      console.error(err);
      showAlert('Koneksi Gagal', 'Pastikan kamera USB terpasang dan bisa diakses.', 'error');
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
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Local Webcam</h1>
        <p className="text-slate-500">Connect to a USB or integrated webcam</p>
      </header>

      <div className="flex flex-col gap-6 flex-grow min-h-0">
        <div className="flex flex-col gap-6">
          
          <div className="card-minimal p-6">
            {!sessionId || status === 'done' || status === 'error' ? (
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Camera Index / ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Usb className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <select
                      value={deviceIndex}
                      onChange={(e) => setDeviceIndex(parseInt(e.target.value))}
                      className="w-full input-minimal pl-12 pr-4 py-4 appearance-none"
                    >
                      <option value={0}>Camera 0 (Default)</option>
                      <option value={1}>Camera 1</option>
                      <option value={2}>Camera 2</option>
                      <option value={3}>Camera 3</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-8 py-4 btn-primary"
                >
                  <WebcamIcon size={20} />
                  {isConnecting ? 'Connecting...' : 'Start Camera'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <WebcamIcon className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-violet-600 dark:text-violet-400">Camera Active</h3>
                    <p className="text-xs text-slate-500 font-mono">Device Index: {deviceIndex}</p>
                  </div>
                </div>
                <button 
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors border border-red-200 dark:border-red-500/20"
                >
                  <StopCircle size={20} /> Stop Camera
                </button>
              </div>
            )}
          </div>

          <div className="card-minimal p-6 flex flex-col">
            <DetectionStream 
              sessionId={sessionId} 
              status={status} 
              statusMessage={statusMessage} 
              title="Webcam Live Feed"
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

export default Webcam;
