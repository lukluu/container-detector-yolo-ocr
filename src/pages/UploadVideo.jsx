import React, { useState, useEffect } from 'react';
import { UploadCloud, StopCircle, Download } from 'lucide-react';
import { uploadVideo, stopSession, saveSessionToDB } from '../services/api';
import { useSSE } from '../hooks/useSSE';
import { useDialog } from '../components/DialogProvider';
import DetectionStream from '../components/DetectionStream';
import DetectionTable from '../components/DetectionTable';
import ProgressBar from '../components/ProgressBar';

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { detections, progress, status, statusMessage, resultData } = useSSE(sessionId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { showAlert } = useDialog();

  useEffect(() => {
    if ((status === 'done' || status === 'error') && sessionId) {
      setFile(null); 
    }
  }, [status, sessionId]);

  const handleSaveToDB = async () => {
    if (!sessionId) return;
    setIsSaving(true);
    try {
      await saveSessionToDB({
        session_id: sessionId,
        source: 'video',
        file_name: file?.name || 'Unknown',
        total_containers: detections.length,
        result_url: resultData?.output_url || null,
        detections: detections
      });
      setSaveSuccess(true);
      showAlert('Berhasil!', 'Data dan video hasil deteksi berhasil disimpan ke database.', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan ke database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadVideo(file);
      setSessionId(res.session_id);
    } catch (err) {
      console.error(err);
      showAlert('Upload Gagal', 'Pastikan server API Flask sedang berjalan.', 'error');
    } finally {
      setIsUploading(false);
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
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Video Detection</h1>
        <p className="text-slate-500">Upload a video to detect ISO and NK containers</p>
      </header>

      <div className="flex flex-col gap-6 flex-grow min-h-0">
        
        {/* Stream & Controls */}
        <div className="flex flex-col gap-6">
          <div className="card-minimal p-6 flex flex-col">
            <DetectionStream 
              sessionId={sessionId} 
              status={status} 
              statusMessage={statusMessage} 
              resultUrl={resultData?.output_url}
            />
            
            {status === 'active' && (
              <div className="mt-4">
                <ProgressBar 
                  percent={progress.percent} 
                  frame={progress.frame} 
                  total={progress.total} 
                />
              </div>
            )}
          </div>

          <div className="card-minimal p-6">
            {!sessionId || status === 'done' || status === 'error' ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-cyan-500/50 transition-colors">
                    <input type="file" accept="video/mp4,video/avi,video/mkv" className="hidden" onChange={handleFileChange} />
                    <UploadCloud className="w-6 h-6 text-slate-400 mr-2" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {file ? file.name : 'Choose a video file'}
                    </span>
                  </label>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto px-8 py-4 btn-primary"
                >
                  {isUploading ? 'Uploading...' : 'Start Detection'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-cyan-600 dark:text-cyan-400">Processing Video</h3>
                  <p className="text-sm text-slate-500">{file?.name}</p>
                </div>
                <button 
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors border border-red-200 dark:border-red-500/20"
                >
                  <StopCircle size={20} /> Stop Process
                </button>
              </div>
            )}

            {(status === 'done' || status === 'error') && (
              <div className={`mt-4 p-4 rounded-xl flex items-center justify-between border ${status === 'done' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20'}`}>
                <div>
                  <h4 className={`font-bold mb-1 ${status === 'done' ? 'text-emerald-700 dark:text-emerald-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    {status === 'done' ? 'Processing Complete' : 'Processing Stopped'}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Terdapat {detections.length} data kontainer</p>
                </div>
                <button 
                  onClick={handleSaveToDB}
                  disabled={isSaving || saveSuccess}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border disabled:opacity-50 ${status === 'done' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 dark:border-emerald-500/20' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/30 dark:border-yellow-500/20'}`}
                >
                  <Download size={18} /> {saveSuccess ? 'Tersimpan' : (isSaving ? 'Menyimpan...' : 'Simpan ke Database')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="min-h-[400px]">
          <DetectionTable detections={detections} />
        </div>

      </div>
    </div>
  );
};

export default UploadVideo;
