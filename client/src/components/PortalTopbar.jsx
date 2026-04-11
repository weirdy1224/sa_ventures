import { useAuth } from '../context/AuthContext';

const TITLES = { admin: 'Admin Panel', staff: 'Staff Portal', delivery: 'Delivery App' };

export default function PortalTopbar({ role, onMenuClick }) {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="portal-topbar">
      <button onClick={onMenuClick} style={{ display: 'none', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 18 }} className="sidebar-toggle">☰</button>

      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
          <span className={`badge badge-gold`} style={{ fontSize: 10 }}>{role}</span>
        </div>
        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--navy)', fontSize: 16 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      <style>{`@media (max-width: 1024px) { .sidebar-toggle { display: block !important; } }`}</style>
    </div>
  );
}
