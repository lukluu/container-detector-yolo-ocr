import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
  console.log("Connecting to MySQL...");
  
  // Connect without DB first to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log("Creating database 'deteksi_container' if not exists...");
    await connection.query('CREATE DATABASE IF NOT EXISTS deteksi_container;');
    await connection.query('USE deteksi_container;');

    console.log("Creating table 'sessions'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        source VARCHAR(50) NOT NULL,
        file_name VARCHAR(255),
        total_containers INT DEFAULT 0,
        result_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating table 'detections'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS detections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        detection_id INT,
        nk VARCHAR(100),
        iso VARCHAR(100),
        confidence FLOAT,
        img_nk VARCHAR(500),
        img_iso VARCHAR(500),
        video_time INT,
        timestamp VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database and tables created successfully!");
  } catch (err) {
    console.error("Error creating database/tables:", err);
  } finally {
    await connection.end();
  }
}

initDB();
