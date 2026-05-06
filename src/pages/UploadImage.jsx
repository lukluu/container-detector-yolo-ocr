import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage, saveSessionToDB } from '../services/api';
import { useDialog } from '../components/DialogProvider';

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const { showAlert } = useDialog();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      showAlert('Format Salah', 'Harap upload file berupa gambar (JPG, PNG)', 'error');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultData(null);
    setSaveSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultData(null);
    try {
      const res = await uploadImage(file);
      setResultData(res.data);
      if (res.status === 'failed') {
        showAlert('Tidak Ditemukan', res.message, 'warning');
      }
    } catch (err) {
      console.error(err);
      showAlert('Upload Gagal', err.message || 'Pastikan server API Flask sedang berjalan.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!resultData) return;
    setIsSaving(true);
    try {
      await saveSessionToDB({
        session_id: resultData.id,
        source: 'image',
        file_name: file?.name || 'Unknown_Photo',
        total_containers: (resultData.nk || resultData.iso) ? 1 : 0,
        result_url: null,
        detections: [{
          id: 1,
          nk: resultData.nk,
          iso: resultData.iso,
          confidence: resultData.confidence,
          img_nk: resultData.img_nk,
          img_iso: resultData.img_iso,
          video_time: 0,
          timestamp: resultData.timestamp
        }]
      });
      setSaveSuccess(true);
      showAlert('Berhasil!', 'Data hasil deteksi foto berhasil disimpan ke database.', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan ke database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
      
      <header>
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Image Detection</h1>
        <p className="text-slate-500">Upload foto statis untuk mendeteksi nomor kontainer</p>
      </header>

      <div className="flex flex-col gap-6 flex-grow min-h-0 pb-8">
        
        {/* Upload & Preview Area */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="card-minimal p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={resultData?.img_full || previewUrl} 
                  alt="Preview" 
                  className={`max-h-[500px] w-auto object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 ${resultData?.img_full ? 'cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all' : ''}`}
                  onClick={() => {
                    if (resultData?.img_full) setLightboxImg(resultData.img_full);
                  }}
                />
                {!isProcessing && !resultData && (
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-slate-900/60 dark:bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-md shadow-sm"
                  >
                    ✕
                  </button>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                    <Loader2 className="w-12 h-12 text-cyan-600 dark:text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Memproses Foto...</h3>
                    <p className="text-slate-600 dark:text-slate-300">Menjalankan YOLOv5 & EasyOCR</p>
                  </div>
                )}
              </div>
            ) : (
              <label 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all group"
              >
                <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleFileChange} />
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:scale-110 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-all">
                  <UploadCloud className="w-10 h-10 text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Klik atau Tarik Foto Kesini</h3>
                <p className="text-slate-500 text-sm">Mendukung format JPG, JPEG, PNG</p>
              </label>
            )}
            
            {file && !resultData && !isProcessing && (
              <div className="mt-6 w-full flex justify-center">
                <button 
                  onClick={handleUpload}
                  className="px-8 py-4 btn-primary transition-all flex items-center gap-2"
                >
                  <ImageIcon size={20}/> Deteksi Nomor Kontainer
                </button>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="card-minimal p-6 flex-1 flex flex-col max-w-lg w-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              Hasil Deteksi
            </h2>

            {resultData ? (
              <div className="flex flex-col gap-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center text-center">
                    <p className="text-slate-500 text-xs font-medium mb-1">Nomor Kontainer (NK)</p>
                    <p className={`text-2xl font-bold ${resultData.nk ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'}`}>
                      {resultData.nk || '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center text-center">
                    <p className="text-slate-500 text-xs font-medium mb-1">Kode ISO</p>
                    <p className={`text-2xl font-bold ${resultData.iso ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-600'}`}>
                      {resultData.iso || '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Confidence Skor</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round((resultData.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${resultData.confidence > 0.8 ? 'bg-emerald-500' : resultData.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${(resultData.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
                    <p className="text-slate-500 text-xs font-medium">Crop NK</p>
                    {resultData.img_nk ? (
                      <button onClick={() => setLightboxImg(resultData.img_nk)} className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-cyan-500 transition-all bg-white dark:bg-slate-900">
                        <img src={resultData.img_nk} alt="NK Crop" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="w-full aspect-video rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-black/20 flex items-center justify-center text-slate-400 dark:text-slate-600">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
                    <p className="text-slate-500 text-xs font-medium">Crop ISO</p>
                    {resultData.img_iso ? (
                      <button onClick={() => setLightboxImg(resultData.img_iso)} className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-violet-500 transition-all bg-white dark:bg-slate-900">
                        <img src={resultData.img_iso} alt="ISO Crop" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="w-full aspect-video rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-black/20 flex items-center justify-center text-slate-400 dark:text-slate-600">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                </div>

                {(resultData.nk || resultData.iso) && (
                  <button 
                    onClick={handleSaveToDB}
                    disabled={isSaving || saveSuccess}
                    className={`mt-4 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      saveSuccess 
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm cursor-not-allowed' 
                        : 'btn-primary'
                    } disabled:opacity-50`}
                  >
                    <Download size={20} /> {saveSuccess ? 'Tersimpan di Database' : (isSaving ? 'Menyimpan...' : 'Simpan ke Database')}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-center px-8">Upload gambar dan klik Deteksi untuk melihat hasil analisis OCR</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
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

export default UploadImage;
