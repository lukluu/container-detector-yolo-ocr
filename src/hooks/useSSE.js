import { useState, useEffect, useRef } from 'react';

export const useSSE = (sessionId) => {
  const [detections, setDetections] = useState([]);
  const [progress, setProgress] = useState({ frame: 0, total: 0, percent: 0, containers: 0 });
  const [status, setStatus] = useState('idle'); // idle, connecting, active, done, error
  const [statusMessage, setStatusMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setDetections([]);
      setProgress({ frame: 0, total: 0, percent: 0, containers: 0 });
      setStatus('idle');
      setStatusMessage('');
      setResultData(null);
      return;
    }

    setStatus('connecting');
    const url = `/api/events/${sessionId}`;
    const source = new EventSource(url);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      if (event.data === ': heartbeat') return;

      try {
        const data = JSON.parse(event.data);
        const type = data._type;

        if (type === 'connected') {
          setStatus('active');
          setStatusMessage('Streaming connected');
        } else if (type === 'status') {
          setStatusMessage(data.message);
        } else if (type === 'progress') {
          setProgress({
            frame: data.frame,
            total: data.total,
            percent: data.percent,
            containers: data.containers
          });
        } else if (type === 'detection') {
          setDetections((prev) => [data, ...prev]);
        } else if (type === 'update') {
          setDetections((prev) => {
            const index = prev.findIndex(d => d.id === data.id);
            if (index !== -1) {
              const newData = [...prev];
              newData[index] = { ...newData[index], ...data };
              return newData;
            }
            return [data, ...prev];
          });
        } else if (type === 'done') {
          setStatus('done');
          setStatusMessage(data.message);
          setResultData({
            output_file: data.output_file,
            output_url: data.output_url,
            total: data.total
          });
          source.close();
        } else if (type === 'error') {
          setStatus('error');
          setStatusMessage(data.message);
          source.close();
        }
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    source.onerror = (err) => {
      console.error("EventSource error", err);
      // Depending on the connection state we might want to close it if it fails repeatedly
      // For now, let EventSource auto-reconnect if it's a temporary drop.
      if (source.readyState === EventSource.CLOSED) {
        setStatus('error');
        setStatusMessage('Connection closed by server.');
      }
    };

    return () => {
      source.close();
    };
  }, [sessionId]);

  return { detections, progress, status, statusMessage, resultData };
};
