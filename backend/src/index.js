import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import songsRoutes from './routes/songs.js';
import adminSongsRoutes from './routes/adminSongs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Serve cover art statically
app.use('/uploads/covers', express.static(path.join(__dirname, '..', 'uploads', 'covers')));

app.use('/api/admin', authRoutes);
app.use('/api/admin/songs', adminSongsRoutes);
app.use('/api', songsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Wavelane API' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Wavelane API listening on http://localhost:${PORT}`);
});
