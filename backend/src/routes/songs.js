import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '..', '..', 'uploads', 'audio');

const router = Router();

function serialize(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    genre: song.genre,
    duration: song.duration,
    playCount: song.playCount,
    createdAt: song.createdAt,
    coverUrl: song.coverPath ? `/uploads/covers/${song.coverPath}` : null,
    streamUrl: `/api/stream/${song.id}`,
  };
}

// GET /api/songs?q=search
router.get('/songs', (req, res) => {
  const q = (req.query.q || '').trim();
  let songs;

  if (q) {
    const like = `%${q}%`;
    songs = db
      .prepare(
        `SELECT * FROM songs
         WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ?
         ORDER BY createdAt DESC`
      )
      .all(like, like, like, like);
  } else {
    songs = db.prepare('SELECT * FROM songs ORDER BY createdAt DESC').all();
  }

  res.json(songs.map(serialize));
});

// GET /api/songs/:id
router.get('/songs/:id', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(Number(req.params.id));
  if (!song) return res.status(404).json({ error: 'Song not found' });
  res.json(serialize(song));
});

// GET /api/stream/:id  -- supports HTTP range requests for seeking
router.get('/stream/:id', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(Number(req.params.id));
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const filePath = path.join(AUDIO_DIR, song.audioPath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file missing on server' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  db.prepare('UPDATE songs SET playCount = playCount + 1 WHERE id = ?').run(song.id);

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
