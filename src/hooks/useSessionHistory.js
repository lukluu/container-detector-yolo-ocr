import { useState, useEffect } from 'react';

const STORAGE_KEY = 'container_detection_history';

export const useSessionHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addSession = (sessionData) => {
    setHistory(prev => {
      // Check if session already exists, if so update it
      const existingIdx = prev.findIndex(s => s.sessionId === sessionData.sessionId);
      let newHistory;
      if (existingIdx !== -1) {
        newHistory = [...prev];
        newHistory[existingIdx] = { ...newHistory[existingIdx], ...sessionData };
      } else {
        newHistory = [
          {
            ...sessionData,
            timestamp: new Date().toISOString(),
          },
          ...prev
        ];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, addSession, clearHistory };
};
