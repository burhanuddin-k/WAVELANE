const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const uploadDirs = ['uploads/audio', 'uploads/covers', 'data'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// JSON DB Helper
const dbPath = path.join(__dirname, 'data', 'songs.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));

const getSongs = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveSongs = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// File Upload Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') cb(null, 'uploads/audio/');
    else if (file.fieldname === 'cover') cb(null, 'uploads/covers/');
    else cb(new Error('Invalid field'), null);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---

// Stats API
app.get('/api/stats', (req, res) => {
  const songs = getSongs();
  const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
  const uniqueArtists = new Set(songs.map(s => s.artist)).size;
  res.json({
    songs: songs.length,
    published: songs.length,
    plays: totalPlays,
    artists: uniqueArtists
  });
});

// Get all songs (for listener app and admin catalog)
app.get('/api/admin/songs', (req, res) => {
  res.json(getSongs());
});

// Upload new song
app.post('/api/admin/songs', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  try {
    const { title, artist, album, genre, description } = req.body;
    if (!req.files.audio) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const songs = getSongs();
    const newSong = {
      id: Date.now().toString(),
      title,
      artist,
      album: album || 'Single',
      genre: genre || 'Other',
      description: description || '',
      audio_url: `/uploads/audio/${req.files.audio[0].filename}`,
      cover_url: req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : '/assets/default-cover.svg',
      plays: 0,
      createdAt: new Date().toISOString()
    };

    songs.unshift(newSong);
    saveSongs(songs);
    res.status(201).json(newSong);
  } catch (err) {
    res.status(500).json({ error: 'Server failed to process upload.' });
  }
});

// Track play count increment
app.post('/api/songs/:id/play', (req, res) => {
  const songs = getSongs();
  const song = songs.find(s => s.id === req.params.id);
  if (song) {
    song.plays = (song.plays || 0) + 1;
    saveSongs(songs);
    return res.json({ success: true, plays: song.plays });
  }
  res.status(404).json({ error: 'Song not found' });
});

// Delete song
app.delete('/api/admin/songs/:id', (req, res) => {
  let songs = getSongs();
  const songToDelete = songs.find(s => s.id === req.params.id);

  if (songToDelete) {
    // Clean up local files
    const deleteFile = (url) => {
      if (url && !url.includes('/assets/')) {
        const filePath = path.join(__dirname, url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    };
    deleteFile(songToDelete.audio_url);
    deleteFile(songToDelete.cover_url);

    songs = songs.filter(s => s.id !== req.params.id);
    saveSongs(songs);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Song not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`WaveLane Server running on http://localhost:${PORT}`);
});