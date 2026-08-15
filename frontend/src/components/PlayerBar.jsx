import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Waveform() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { getAnalyser, isPlaying } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext('2d');
    const BARS = 28;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      const analyser = getAnalyser();
      const width = canvas.width;
      const height = canvas.height;
      ctx2d.clearRect(0, 0, width, height);

      let data;
      if (analyser && isPlaying) {
        data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
      }

      const barWidth = width / BARS;
      for (let i = 0; i < BARS; i++) {
        let v;
        if (data) {
          const idx = Math.floor((i / BARS) * data.length);
          v = data[idx] / 255;
        } else {
          v = 0.06;
        }
        const barHeight = Math.max(2, v * height);
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        ctx2d.fillStyle = isPlaying ? '#c9ff3d' : '#3a3d47';
        ctx2d.fillRect(x, y, barWidth - 2, barHeight);
      }
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [getAnalyser, isPlaying]);

  return <canvas ref={canvasRef} width={140} height={28} style={{ display: 'block' }} />;
}

export default function PlayerBar() {
  const { current, isPlaying, toggle, next, prev, progress, duration, seek, volume, changeVolume } = usePlayer();

  if (!current) {
    return (
      <footer style={styles.emptyBar}>
        <span style={styles.emptyText}>Pick a track to start listening</span>
      </footer>
    );
  }

  return (
    <footer style={styles.bar}>
      <div style={styles.nowPlaying}>
        <div style={styles.cover}>
          {current.coverUrl ? (
            <img src={current.coverUrl} alt="" style={styles.coverImg} />
          ) : (
            <div style={styles.coverPlaceholder}>{current.title[0]?.toUpperCase()}</div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={styles.title}>{current.title}</div>
          <div style={styles.artist}>{current.artist}</div>
        </div>
      </div>

      <div style={styles.center}>
        <div style={styles.controls}>
          <button onClick={prev} style={styles.iconBtn} aria-label="Previous track">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14l-11-7z" /></svg>
          </button>
          <button onClick={toggle} style={styles.playBtn} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0b0f"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0b0f"><path d="M7 5l13 7-13 7z" /></svg>
            )}
          </button>
          <button onClick={next} style={styles.iconBtn} aria-label="Next track">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
          </button>
        </div>

        <div style={styles.progressRow}>
          <span style={styles.time}>{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(progress, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      <div style={styles.right}>
        <Waveform />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          style={{ ...styles.slider, width: 80 }}
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}

const styles = {
  bar: {
    gridColumn: '1 / -1',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'grid',
    gridTemplateColumns: '260px 1fr 260px',
    alignItems: 'center',
    padding: '10px 20px',
    gap: 16,
  },
  emptyBar: {
    gridColumn: '1 / -1',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
  },
  emptyText: { color: 'var(--text-faint)', fontSize: 13, fontFamily: 'var(--font-mono)' },
  nowPlaying: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  cover: { width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0 },
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
  },
  title: { fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  artist: { fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  controls: { display: 'flex', alignItems: 'center', gap: 14 },
  iconBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 4 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--accent)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 480 },
  time: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', width: 32, textAlign: 'center' },
  slider: {
    flex: 1,
    accentColor: '#c9ff3d',
    height: 4,
  },
  right: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 },
};
