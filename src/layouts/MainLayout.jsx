import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Video, Camera, Webcam as WebcamIcon, History, Activity, Image as ImageIcon, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

const MainLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/video', icon: <Video />, label: 'Upload Video' },
    { path: '/image', icon: <ImageIcon />, label: 'Upload Foto' },
    { path: '/cctv', icon: <Camera />, label: 'IP Camera' },
    { path: '/webcam', icon: <WebcamIcon />, label: 'Webcam' },
    { path: '/logs', icon: <History />, label: 'Log History' },
  ];

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
          <Activity size={24} />
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Deteksi<span className="text-cyan-600 dark:text-cyan-400">Container</span></h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 dark:bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between h-auto md:h-20">
          <div>
            <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 mb-2">
              <Activity size={28} />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Deteksi<span className="text-cyan-600 dark:text-cyan-400">Container</span></h1>
            </div>
            <p className="text-xs text-slate-500 font-mono">YOLOv5 + EasyOCR</p>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto mt-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-100 dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`
              }
            >
              {React.cloneElement(item.icon, { size: 20 })}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pt-16 md:pt-0">
        <div className="relative z-10 min-h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;
