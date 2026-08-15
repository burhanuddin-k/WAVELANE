import React, { useEffect, useRef, useState } from 'react';
import { fetchAdminSongs, uploadSong, updateSong, deleteSong, setToken } from '../api.js';
import { useNavigate } from 'react-router-dom';

function formatDuration(sec) {
  if (!sec) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Dashboard({ admin, onLogout }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  function loadSongs() {
    setLoading(true);
    fetchAdminSongs()
      .then(setSongs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSongs();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const form = e.target;
    const audioFile = form.audio.files[0];

    if (!audioFile) {
      setError('Please choose an audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('artist', form.artist.value);
    formData.append('album', form.album.value);
    formData.append('genre', form.genre.value);
    formData.append('audio', audioFile);
    if (form.cover.files[0]) formData.append('cover', form.cover.files[0]);

    setUploading(true);
    try {
      await uploadSong(formData);
      setSuccess('Track uploaded successfully.');
      form.reset();
      loadSongs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this track? This cannot be undone.')) return;
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveEdit(id, fields) {
    try {
      const updated = await updateSong(id, fields);
      setSongs((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    setToken(null);
    onLogout();
    navigate('/login');
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>~~~</span>
          <span style={styles.brandName}>Wavelane Admin</span>
        </div>
        <div style={styles.topbarRight}>
          <span style={styles.adminName}>{admin?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.uploadCard}>
          <h2 style={styles.sectionTitle}>Upload a track</h2>
          <form ref={formRef} onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Title
                <input name="title" required style={styles.input} placeholder="Track title" />
              </label>
              <label style={styles.label}>
                Artist
                <input name="artist" required style={styles.input} placeholder="Artist name" />
              </label>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Album <span style={styles.optional}>(optional)</span>
                <input name="album" style={styles.input} placeholder="Album name" />
              </label>
              <label style={styles.label}>
                Genre <span style={styles.optional}>(optional)</span>
                <input name="genre" style={styles.input} placeholder="e.g. Electronic" />
              </label>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Audio file
                <input name="audio" type="file" accept="audio/*" required style={styles.fileInput} />
              </label>
              <label style={styles.label}>
                Cover art <span style={styles.optional}>(optional)</span>
                <input name="cover" type="file" accept="image/*" style={styles.fileInput} />
              </label>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button type="submit" disabled={uploading} style={styles.uploadBtn}>
              {uploading ? 'Uploading…' : 'Upload track'}
            </button>
          </form>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Catalog ({songs.length})</h2>
          {loading ? (
            <p style={styles.muted}>Loading…</p>
          ) : songs.length === 0 ? (
            <p style={styles.muted}>No tracks uploaded yet.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span>Duration</span>
                <span>Plays</span>
                <span></span>
              </div>
              {songs.map((song) =>
                editingId === song.id ? (
                  <EditRow key={song.id} song={song} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
                ) : (
                  <div key={song.id} style={styles.tableRow}>
                    <span style={styles.rowTitle}>{song.title}</span>
                    <span>{song.artist}</span>
                    <span style={styles.muted}>{song.album || '—'}</span>
                    <span style={{ ...styles.muted, fontFamily: 'var(--font-mono)' }}>{formatDuration(song.duration)}</span>
                    <span style={{ ...styles.muted, fontFamily: 'var(--font-mono)' }}>{song.playCount}</span>
                    <span style={styles.actions}>
                      <button onClick={() => setEditingId(song.id)} style={styles.smallBtn}>Edit</button>
                      <button onClick={() => handleDelete(song.id)} style={styles.smallBtnDanger}>Delete</button>
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EditRow({ song, onSave, onCancel }) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [album, setAlbum] = useState(song.album || '');

  return (
    <div style={styles.tableRow}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.editInput} />
      <input value={artist} onChange={(e) => setArtist(e.target.value)} style={styles.editInput} />
      <input value={album} onChange={(e) => setAlbum(e.target.value)} style={styles.editInput} />
      <span></span>
      <span></span>
      <span style={styles.actions}>
        <button onClick={() => onSave(song.id, { title, artist, album })} style={styles.smallBtn}>Save</button>
        <button onClick={onCancel} style={styles.smallBtnGhost}>Cancel</button>
      </span>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', background: 'var(--bg)' },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: 8 },
  brandMark: { fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 14 },
  brandName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  adminName: { fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  logoutBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: 13,
  },
  main: { maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px', display: 'flex', flexDirection: 'column', gap: 40 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16 },
  uploadCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  optional: { color: 'var(--text-faint)' },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
  },
  fileInput: {
    padding: '9px 4px',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  error: { color: '#ff6b6b', fontSize: 13, margin: 0 },
  success: { color: 'var(--accent)', fontSize: 13, margin: 0 },
  uploadBtn: {
    alignSelf: 'flex-start',
    padding: '11px 22px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--accent)',
    color: 'var(--bg)',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'var(--font-display)',
  },
  muted: { color: 'var(--text-muted)', fontSize: 13.5 },
  table: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 90px 70px 140px',
    padding: '10px 18px',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-faint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 90px 70px 140px',
    padding: '12px 18px',
    fontSize: 13.5,
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    gap: 8,
  },
  rowTitle: { fontWeight: 500 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  smallBtn: {
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 12,
  },
  smallBtnDanger: {
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid #4a2530',
    background: 'transparent',
    color: '#ff6b6b',
    fontSize: 12,
  },
  smallBtnGhost: {
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 12,
  },
  editInput: {
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 13,
  },
};
