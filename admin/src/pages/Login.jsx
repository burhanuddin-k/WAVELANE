import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api.js';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const admin = await login(email, password);
      onLoggedIn(admin);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>~~~</span>
          <span style={styles.brandName}>Wavelane Admin</span>
        </div>
        <p style={styles.subtitle}>Sign in to manage your music catalog.</p>

        <label style={styles.label}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="admin@wavelane.app"
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  },
  card: {
    width: 360,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: 8 },
  brandMark: { fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 14 },
  brandName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 },
  subtitle: { color: 'var(--text-muted)', fontSize: 13.5, margin: '0 0 8px' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 14,
  },
  error: { color: '#ff6b6b', fontSize: 13, margin: 0 },
  button: {
    marginTop: 8,
    padding: '11px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--accent)',
    color: 'var(--bg)',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'var(--font-display)',
  },
};
