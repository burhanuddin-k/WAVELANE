import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database directory inside container
const DATA_DIR = path.join(__dirname, '..', 'data');

// Create directory if it doesn't exist
fs.mkdirSync(DATA_DIR, { recursive: true });

// Database path
const DB_PATH = path.join(DATA_DIR, 'dev.db');

console.log(`SQLite database: ${DB_PATH}`);

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Admin',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    genre TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    coverPath TEXT,
    audioPath TEXT NOT NULL,
    fileSize INTEGER NOT NULL DEFAULT 0,
    playCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
`);

export default db;