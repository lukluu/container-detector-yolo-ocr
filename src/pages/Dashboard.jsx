import React, { useState, useEffect } from 'react';
import { getStatus, getDBSessions } from '../services/api';
import { Activity, Video, Camera, Database, Clock, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, dbRes] = await Promise.all([
          getStatus().catch(() => ({ active_sessions: [] })),
          getDBSessions().catch(() => [])
        ]);
        setStatus(statusRes);
        setSessions(dbRes);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalContainers = sessions.reduce((acc, curr) => acc + (curr.total_containers || 0), 0);
  const activeCount = status?.active_sessions?.length || 0;

  return (
    <div className="h-full flex flex-col gap-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-3">
          <LayoutDashboard className="text-cyan-600 dark:text-cyan-400" />
          Dashboard Overview
        </h1>
        <p className="text-slate-500">Real-time status and historical data of container detections.</p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1 */}
        <div className="card-minimal p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 rounded-xl">
              <Activity size={24} />
            </div>
            {activeCount > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Active Streams</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="card-minimal p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl inline-block">
              <Database size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Sessions</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="card-minimal p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="p-3 bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 rounded-xl inline-block">
              <Video size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Detections</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalContainers}</p>
          </div>
        </div>

        {/* Stat Card 4 (Quick Actions) */}
        <div className="card-minimal p-6 flex flex-col justify-center gap-3 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Quick Actions</h3>
          <Link to="/video" className="btn-primary text-sm py-2">
            Upload Video
          </Link>
          <Link to="/cctv" className="w-full text-center py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Connect IP Camera
          </Link>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        {/* Active Sessions List */}
        <div className="card-minimal flex flex-col col-span-1 lg:col-span-1">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Active Processes</h2>
          </div>
          <div className="p-5 flex-grow overflow-y-auto">
            {!isLoading && status?.active_sessions?.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Clock className="mb-2 opacity-50" size={32} />
                <p>No active sessions</p>
              </div>
            )}
            <div className="space-y-4">
              {status?.active_sessions?.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 px-2 py-1 rounded">
                      {s.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{s.elapsed_s}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Containers:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{s.containers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Frames:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{s.frames}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="card-minimal flex flex-col col-span-1 lg:col-span-2">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent History</h2>
            <Link to="/logs" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Source</th>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Date</th>
                  <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Detections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {sessions.slice(0, 5).map(session => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                          {session.source === 'video' ? <Video size={16} /> : <Camera size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200 capitalize">{session.source}</p>
                          <p className="text-xs text-slate-500 font-mono truncate w-32 md:w-48" title={session.file_name}>{session.file_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(session.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{session.total_containers}</span>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">No recent history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
