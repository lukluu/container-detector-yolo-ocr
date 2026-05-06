import React, { useState, useEffect } from 'react';
import { getDBSessions, deleteDBSession, getSessionDetections, getResults } from '../services/api';
import { Video, Camera, Webcam as WebcamIcon, Trash2, Download, Play, ChevronDown, ChevronUp, Loader2, FileVideo } from 'lucide-react';
import { useDialog } from '../components/DialogProvider';

const Logs = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detectionsMap, setDetectionsMap] = useState({});
  const [loadingDetections, setLoadingDetections] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [serverVideos, setServerVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const { showConfirm, showAlert } = useDialog();

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await getDBSessions();
      setSessions(res);
    } catch (err) {
      console.error("Failed to fetch DB sessions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServerVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await getResults();
      setServerVideos(res.results || []);
    } catch (err) {
      console.error("Failed to fetch server videos", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchServerVideos();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm(
      'Hapus Sesi?', 
      'Yakin ingin menghapus data sesi ini beserta semua deteksinya dari database? Tindakan ini tidak dapat dibatalkan.', 
      'error'
    );
    if (!isConfirmed) return;

    try {
      await deleteDBSession(id);
      fetchSessions();
      showAlert('Berhasil', 'Sesi berhasil dihapus dari database', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Gagal', 'Gagal menghapus data dari database', 'error');
    }
  };

  const toggleExpand = async (sessionId) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(sessionId);
    if (!detectionsMap[sessionId]) {
      setLoadingDetections(true);
      try {
        const res = await getSessionDetections(sessionId);
        setDetectionsMap(prev => ({ ...prev, [sessionId]: res }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetections(false);
      }
    }
  };

  const getSourceIcon = (source) => {
    switch(source) {
      case 'video': return <Video size={16} className="text-blue-400" />;
      case 'cctv': return <Camera size={16} className="text-cyan-400" />;
      case 'webcam': return <WebcamIcon size={16} className="text-violet-400" />;
      default: return <Video size={16} />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-grow min-h-0 pb-8">
        
        {/* Database Sessions */}
        <div className="card-minimal xl:col-span-2 overflow-hidden flex flex-col h-[600px] xl:h-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400"></span>
              Session Logs (Database)
            </h2>
          </div>
          <div className="overflow-auto flex-grow">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500">Loading dari Database...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 text-slate-500 dark:text-slate-400 shadow-sm">
                <tr>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Source & Info</th>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Waktu Simpan</th>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Total Deteksi</th>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {sessions.map((session) => (
                  <React.Fragment key={session.id}>
                    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${expandedId === session.session_id ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                            {getSourceIcon(session.source)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-200 capitalize">{session.source}</p>
                            <p className="text-xs text-slate-500 font-mono truncate max-w-[300px]" title={session.file_name}>
                              {session.file_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-xs font-mono">
                        {new Date(session.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 rounded font-bold">
                          {session.total_containers} Containers
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {session.result_url && (
                            <>
                              <button 
                                onClick={() => setPlayingVideo(session.result_url)}
                                className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-500/20"
                                title="Play Video"
                              >
                                <Play size={16} />
                              </button>
                              <a 
                                href={session.result_url}
                                target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-500/20"
                                title="Download Video"
                              >
                                <Download size={16} />
                              </a>
                            </>
                          )}
                          
                          <button 
                            onClick={() => toggleExpand(session.session_id)}
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Lihat Detail Deteksi"
                          >
                            {expandedId === session.session_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(session.id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors border border-red-200 dark:border-red-500/20"
                            title="Hapus dari Database"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedId === session.session_id && (
                      <tr>
                        <td colSpan="4" className="p-0 bg-slate-50 dark:bg-slate-900/30">
                          <div className="p-4 border-l-2 border-cyan-500 ml-4 mb-4 mt-2 bg-white dark:bg-slate-900 shadow-sm border-t border-r border-b border-slate-200 dark:border-slate-800 rounded-r-xl">
                            <h4 className="text-sm font-semibold mb-3 text-cyan-600 dark:text-cyan-400">Detail Hasil Deteksi</h4>
                            {loadingDetections ? (
                              <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                                <Loader2 size={16} className="animate-spin" /> Mengambil data...
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    <tr>
                                      <th className="p-2 font-medium rounded-tl-lg">ID</th>
                                      <th className="p-2 font-medium">NK</th>
                                      <th className="p-2 font-medium">ISO</th>
                                      <th className="p-2 font-medium">Crop NK & ISO</th>
                                      <th className="p-2 font-medium">Waktu Video</th>
                                      <th className="p-2 font-medium rounded-tr-lg">Timestamp</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {(detectionsMap[session.session_id] || []).map((det) => (
                                      <tr key={det.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="p-2 font-mono text-slate-500">#{det.detection_id}</td>
                                        <td className="p-2 font-bold text-cyan-600 dark:text-cyan-400">{det.nk || '-'}</td>
                                        <td className="p-2 font-bold text-violet-600 dark:text-violet-400">{det.iso || '-'}</td>
                                        <td className="p-2">
                                          <div className="flex gap-2">
                                            {det.img_nk && (
                                              <button 
                                                onClick={() => setLightboxImg(det.img_nk)}
                                                className="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer relative"
                                              >
                                                <img src={det.img_nk} className="w-full h-full object-cover" alt="NK Crop" />
                                              </button>
                                            )}
                                            {det.img_iso && (
                                              <button 
                                                onClick={() => setLightboxImg(det.img_iso)}
                                                className="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer"
                                              >
                                                <img src={det.img_iso} className="w-full h-full object-cover" alt="ISO Crop" />
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                        <td className="p-2 text-slate-500 font-mono">Frame {det.video_time}</td>
                                        <td className="p-2 text-slate-500 font-mono">{det.timestamp}</td>
                                      </tr>
                                    ))}
                                    {(!detectionsMap[session.session_id] || detectionsMap[session.session_id].length === 0) && (
                                      <tr>
                                        <td colSpan="6" className="p-4 text-center text-slate-500">Tidak ada data kontainer</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500">
                      Belum ada data riwayat di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Raw Videos on Server */}
      <div className="card-minimal xl:col-span-1 overflow-hidden flex flex-col h-[600px] xl:h-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <FileVideo className="text-emerald-600 dark:text-emerald-400" />
            Raw Videos (Server)
          </h2>
        </div>
        <div className="overflow-auto flex-grow p-4">
          {loadingVideos ? (
            <div className="h-full flex items-center justify-center text-slate-500">Loading...</div>
          ) : serverVideos.length > 0 ? (
            <div className="space-y-3">
              {serverVideos.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                      <Video size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-slate-900 dark:text-slate-200 font-mono text-sm truncate w-32 md:w-48">{file.filename}</p>
                      <div className="flex gap-2 text-xs text-slate-500 mt-1">
                        <span>{file.size_mb} MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPlayingVideo(file.url)}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Play Video"
                    >
                      <Play size={16} />
                    </button>
                    <a 
                      href={file.url}
                      target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Download Video"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <FileVideo size={32} className="opacity-20" />
              <p>Belum ada video di server.</p>
            </div>
          )}
        </div>
      </div>

    </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPlayingVideo(null)}>
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
              <h3 className="font-semibold flex items-center gap-2"><Play className="text-cyan-400" size={18}/> Video Playback</h3>
              <button onClick={() => setPlayingVideo(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video 
                src={playingVideo} 
                controls 
                autoPlay 
                className="w-full h-full"
              >
                Browser Anda tidak mendukung video HTML5.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Crop Images */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
            <img src={lightboxImg} alt="Enlarged Crop" className="w-full h-full object-contain max-h-[90vh]" />
          </div>
        </div>
      )}

    </div>
  );
};

export default Logs;
