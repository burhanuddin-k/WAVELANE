import React from 'react';
import { NavLink } from 'react-router-dom';

const svgProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function HomeIcon() {
  return (
    <svg {...svgProps}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandMark}>~~~</span>
        <span style={styles.brandName}>Wavelane</span>
      </div>

      <nav style={styles.nav}>
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
          <HomeIcon /> Home
        </NavLink>
        <NavLink to="/search" style={({ isActive }) => navStyle(isActive)}>
          <SearchIcon /> Search
        </NavLink>
      </nav>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Built with Wavelane &mdash; your own music, your own catalog.
        </p>
      </div>
    </aside>
  );
}

function navStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 8,
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 14.5,
    color: isActive ? 'var(--bg)' : 'var(--text-muted)',
    background: isActive ? 'var(--accent)' : 'transparent',
    transition: 'background 0.15s, color 0.15s',
  };
}

const styles = {
  sidebar: {
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    padding: '22px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  brand: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    padding: '0 6px',
  },
  brandMark: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    fontSize: 14,
    letterSpacing: '-1px',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  footer: {
    marginTop: 'auto',
    padding: '0 6px',
  },
  footerText: {
    fontSize: 11.5,
    color: 'var(--text-faint)',
    lineHeight: 1.5,
  },
};
