import React from 'react';

function formatDuration(sec) {
  if (!sec) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SongRow({ song, index, isCurrent, isPlaying, onPlay }) {
  return (
    <button onClick={onPlay} style={rowStyle(isCurrent)} className="song-row">
      <span style={styles.index}>
        {isCurrent && isPlaying ? <PulseIcon /> : String(index + 1).padStart(2, '0')}
      </span>

      <div style={styles.cover}>
        {song.coverUrl ? (
          <img src={song.coverUrl} alt="" style={styles.coverImg} />
        ) : (
          <div style={styles.coverPlaceholder}>{song.title[0]?.toUpperCase()}</div>
        )}
      </div>

      <div style={styles.meta}>
        <span style={{ ...styles.title, color: isCurrent ? 'var(--accent)' : 'var(--text)' }}>
          {song.title}
        </span>
        <span style={styles.artist}>{song.artist}</span>
      </div>

      {song.album && <span style={styles.album}>{song.album}</span>}
      <span style={styles.duration}>{formatDuration(song.duration)}</span>
    </button>
  );
}

function PulseIcon() {
  return (
    <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 3,
            background: 'var(--accent)',
            borderRadius: 1,
            animation: `bounce 0.9s ${i * 0.15}s infinite ease-in-out`,
            height: 6,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>
    </span>
  );
}

function rowStyle(isCurrent) {
  return {
    display: 'grid',
    gridTemplateColumns: '28px 40px 1fr 160px 56px',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: '8px 12px',
    background: isCurrent ? 'var(--surface-2)' : 'transparent',
    border: 'none',
    borderRadius: 8,
    textAlign: 'left',
  };
}

const styles = {
  index: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12.5,
    color: 'var(--text-faint)',
    display: 'flex',
    alignItems: 'center',
  },
  cover: { width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, var(--accent-2), #3a3550)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    color: '#fff',
    fontSize: 15,
  },
  meta: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  title: {
    fontSize: 14.5,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  artist: {
    fontSize: 12.5,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  album: {
    fontSize: 12.5,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  duration: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-faint)',
    textAlign: 'right',
  },
};
