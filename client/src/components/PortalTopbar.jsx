import { useAuth } from '../context/AuthContext';
import { usePortalTheme } from '../context/PortalThemeContext';

const TITLES = { admin: 'Admin Panel', staff: 'Staff Portal', delivery: 'Delivery App' };

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function PortalTopbar({ role, onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = usePortalTheme();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const isDark = theme === 'dark';

  return (
    <div className="portal-topbar">
      <button
        onClick={onMenuClick}
        style={{
          display: 'none',
          background: 'var(--portal-topbar-toggle-bg)',
          border: 'none',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: 18,
        }}
        className="sidebar-toggle"
      >
        ☰
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle */}
        <button
          id="portal-theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 13px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--portal-theme-btn-bg)',
            color: 'var(--portal-theme-btn-text)',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            transition: 'background 0.2s, color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--portal-theme-btn-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--portal-theme-btn-bg)')}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span style={{ fontSize: 12 }}>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* User Info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
          <span className={`badge badge-gold`} style={{ fontSize: 10 }}>{role}</span>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: 'var(--white)',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      <style>{`@media (max-width: 1024px) { .sidebar-toggle { display: flex !important; } }`}</style>
    </div>
  );
}
