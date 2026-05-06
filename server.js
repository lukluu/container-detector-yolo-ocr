import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'deteksi_container',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Save a new session and its detections
app.post('/api/db/sessions', async (req, res) => {
  const { session_id, source, file_name, total_containers, result_url, detections } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO sessions (session_id, source, file_name, total_containers, result_url) VALUES (?, ?, ?, ?, ?)',
      [session_id, source, file_name, total_containers, result_url]
    );

    if (detections && detections.length > 0) {
      // Process images before saving to DB
      for (const d of detections) {
        if (d.img_nk && d.img_nk.startsWith('data:image')) {
          const base64Data = d.img_nk.replace(/^data:image\/\w+;base64,/, "");
          const filename = `${session_id}_${d.id}_nk.jpg`;
          await fs.writeFile(path.join(process.cwd(), 'public', 'crops', filename), base64Data, 'base64');
          d.img_nk = `/crops/${filename}`;
        }
        if (d.img_iso && d.img_iso.startsWith('data:image')) {
          const base64Data = d.img_iso.replace(/^data:image\/\w+;base64,/, "");
          const filename = `${session_id}_${d.id}_iso.jpg`;
          await fs.writeFile(path.join(process.cwd(), 'public', 'crops', filename), base64Data, 'base64');
          d.img_iso = `/crops/${filename}`;
        }
      }

      const values = detections.map(d => [
        session_id,
        d.id,
        d.nk,
        d.iso,
        d.confidence,
        d.img_nk,
        d.img_iso,
        d.video_time,
        d.timestamp
      ]);

      await pool.query(
        'INSERT INTO detections (session_id, detection_id, nk, iso, confidence, img_nk, img_iso, video_time, timestamp) VALUES ?',
        [values]
      );
    }

    res.status(201).json({ success: true, message: 'Session saved to DB' });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Get all sessions
app.get('/api/db/sessions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sessions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Get detections for a specific session
app.get('/api/db/sessions/:session_id/detections', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM detections WHERE session_id = ? ORDER BY detection_id ASC', [req.params.session_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching detections:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Delete a session and its detections
app.delete('/api/db/sessions/:id', async (req, res) => {
  try {
    // First get the session_id
    const [sessions] = await pool.query('SELECT session_id FROM sessions WHERE id = ?', [req.params.id]);
    if (sessions.length > 0) {
      const sessionId = sessions[0].session_id;
      // Delete detections
      await pool.query('DELETE FROM detections WHERE session_id = ?', [sessionId]);
      // Delete session
      await pool.query('DELETE FROM sessions WHERE id = ?', [req.params.id]);
    }
    
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Database API Server running on port ${PORT}`);
});
