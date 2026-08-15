import React, { useEffect, useState } from 'react';
import { fetchSongs } from '../api.js';
import SongRow from '../components/SongRow.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { current, isPlaying, playAt } = usePlayer();

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Your catalog</p>
        <h1 style={styles.heading}>Recently added</h1>
      </header>

      {loading && <p style={styles.muted}>Loading tracks&hellip;</p>}

      {!loading && songs.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>Nothing here yet</p>
          <p style={styles.muted}>Upload tracks from the admin panel to start building your library.</p>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div style={styles.list}>
          {songs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              isCurrent={current?.id === song.id}
              isPlaying={isPlaying}
              onPlay={() => playAt(songs, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { marginBottom: 24 },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11.5,
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  muted: { color: 'var(--text-muted)', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 2 },
  empty: {
    padding: '48px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 },
};
