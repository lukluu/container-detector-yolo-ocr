const API_BASE = '/api';

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await fetch(`${API_BASE}/video/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Image upload failed');
  }
  return response.json();
};

export const connectCamera = async (url) => {
  const response = await fetch(`${API_BASE}/camera/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error('Failed to connect to camera');
  return response.json();
};

export const connectWebcam = async (index) => {
  const response = await fetch(`${API_BASE}/webcam/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index }),
  });
  if (!response.ok) throw new Error('Failed to connect to webcam');
  return response.json();
};

export const stopSession = async (sid) => {
  const response = await fetch(`${API_BASE}/session/${sid}/stop`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to stop session');
  return response.json();
};

export const getFinal = async (sid) => {
  const response = await fetch(`${API_BASE}/final/${sid}`);
  if (!response.ok) throw new Error('Failed to fetch final data');
  return response.json();
};

export const getResults = async () => {
  const response = await fetch(`${API_BASE}/results`);
  if (!response.ok) throw new Error('Failed to fetch results');
  return response.json();
};

export const getStatus = async () => {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) throw new Error('Failed to fetch status');
  return response.json();
};

export const saveSessionToDB = async (sessionData) => {
  const response = await fetch(`${API_BASE}/db/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  if (!response.ok) throw new Error('Failed to save to database');
  return response.json();
};

export const getDBSessions = async () => {
  const response = await fetch(`${API_BASE}/db/sessions`);
  if (!response.ok) throw new Error('Failed to fetch from database');
  return response.json();
};

export const getSessionDetections = async (sessionId) => {
  const response = await fetch(`${API_BASE}/db/sessions/${sessionId}/detections`);
  if (!response.ok) throw new Error('Failed to fetch detections from database');
  return response.json();
};

export const deleteDBSession = async (id) => {
  const response = await fetch(`${API_BASE}/db/sessions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete from database');
  return response.json();
};
