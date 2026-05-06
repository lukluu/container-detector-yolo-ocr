import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadVideo from './pages/UploadVideo';
import CCTV from './pages/CCTV';
import Webcam from './pages/Webcam';
import Logs from './pages/Logs';
import UploadImage from './pages/UploadImage';
import { DialogProvider } from './components/DialogProvider';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="video" element={<UploadVideo />} />
              <Route path="cctv" element={<CCTV />} />
              <Route path="webcam" element={<Webcam />} />
              <Route path="image" element={<UploadImage />} />
              <Route path="logs" element={<Logs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </ThemeProvider>
  );
}

export default App;
