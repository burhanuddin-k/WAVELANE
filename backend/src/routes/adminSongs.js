import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { parseFile } from 'music-metadata';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.fieldname === 'cover' ? 'covers' : 'audio';
    cb(null, path.join(UPLOAD_ROOT, sub));
  },
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio' && !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Audio file must be an audio format (mp3, wav, m4a, etc.)'));
    }
    if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Cover file must be an image'));
    }
    cb(null, true);
  },
});

const router = Router();
router.use(requireAdmin);

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
  };
}

// GET /api/admin/songs
router.get('/', (req, res) => {
  const songs = db.prepare('SELECT * FROM songs ORDER BY createdAt DESC').all();
  res.json(songs.map(serialize));
});

// POST /api/admin/songs  (multipart: audio, cover?, title, artist, album?, genre?)
router.post(
  '/',
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, artist, album, genre } = req.body;
      const audioFile = req.files?.audio?.[0];
      const coverFile = req.files?.cover?.[0];

      if (!title || !artist) {
        return res.status(400).json({ error: 'Title and artist are required' });
      }
      if (!audioFile) {
        return res.status(400).json({ error: 'An audio file is required' });
      }

      let duration = 0;
      try {
        const metadata = await parseFile(audioFile.path);
        duration = Math.round(metadata.format.duration || 0);
      } catch {
        // If metadata parsing fails, leave duration at 0 rather than failing the upload
      }

      const info = db
        .prepare(
          `INSERT INTO songs (title, artist, album, genre, duration, audioPath, coverPath, fileSize)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          title,
          artist,
          album || null,
          genre || null,
          duration,
          audioFile.filename,
          coverFile ? coverFile.filename : null,
          audioFile.size
        );

      const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(serialize(song));
    } catch (err) {
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  }
);

// PUT /api/admin/songs/:id  (metadata only)
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Song not found' });

  const { title, artist, album, genre } = req.body;
  db.prepare(
    `UPDATE songs SET title = ?, artist = ?, album = ?, genre = ? WHERE id = ?`
  ).run(
    title !== undefined ? title : existing.title,
    artist !== undefined ? artist : existing.artist,
    album !== undefined ? album : existing.album,
    genre !== undefined ? genre : existing.genre,
    id
  );

  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  res.json(serialize(song));
});

// DELETE /api/admin/songs/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  db.prepare('DELETE FROM songs WHERE id = ?').run(id);

  const audioPath = path.join(UPLOAD_ROOT, 'audio', song.audioPath);
  if (fs.existsSync(audioPath)) fs.unlink(audioPath, () => {});
  if (song.coverPath) {
    const coverPath = path.join(UPLOAD_ROOT, 'covers', song.coverPath);
    if (fs.existsSync(coverPath)) fs.unlink(coverPath, () => {});
  }

  res.json({ ok: true });
});

export default router;
