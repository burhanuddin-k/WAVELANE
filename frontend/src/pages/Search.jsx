import React, { useEffect, useState } from 'react';
import { fetchSongs } from '../api.js';
import SongRow from '../components/SongRow.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function Search() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { current, isPlaying, playAt } = usePlayer();

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      fetchSongs(query)
        .then(setSongs)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Find something</p>
        <h1 style={styles.heading}>Search</h1>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, artist, album, or genre"
          style={styles.input}
        />
      </header>

      {loading && <p style={styles.muted}>Searching&hellip;</p>}

      {!loading && query && songs.length === 0 && (
        <p style={styles.muted}>No tracks match &ldquo;{query}&rdquo;.</p>
      )}

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
    margin: '0 0 18px',
  },
  input: {
    width: '100%',
    maxWidth: 460,
    padding: '11px 16px',
    borderRadius: 999,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 14,
  },
  muted: { color: 'var(--text-muted)', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 2 },
};
