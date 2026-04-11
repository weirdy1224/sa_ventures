import { NavLink as RNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { icon: '📊', label: 'Dashboard', to: '/admin' },
  { icon: '📦', label: 'Products', to: '/admin/products' },
  { icon: '🧾', label: 'Orders', to: '/admin/orders' },
  { icon: '💳', label: 'Analytics', to: '/admin/analytics' },
  { icon: '👥', label: 'Staff', to: '/admin/staff' },
  { icon: '🖼️', label: 'Banners', to: '/admin/banners' },
  { icon: '⭐', label: 'Reviews', to: '/admin/reviews' },
  { icon: '🔐', label: 'Security Log', to: '/admin/security' },
];

const STAFF_LINKS = [
  { icon: '📋', label: 'Dashboard', to: '/staff' },
  { icon: '🚚', label: 'Delivery Persons', to: '/staff/delivery-persons' },
  { icon: '💳', label: 'Payments', to: '/staff/payments' },
  { icon: '⭐', label: 'Reviews', to: '/staff/reviews' },
];

const DELIVERY_LINKS = [
  { icon: '🏠', label: 'My Dashboard', to: '/delivery' },
];

const LINK_MAP = { admin: ADMIN_LINKS, staff: STAFF_LINKS, delivery: DELIVERY_LINKS };
const ROLE_COLORS = { admin: 'var(--gold)', staff: 'var(--accent-blue)', delivery: 'var(--accent-green)' };
const ROLE_LABELS = { admin: 'Admin Panel', staff: 'Staff Portal', delivery: 'Delivery App' };

export default function Sidebar({ role, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = LINK_MAP[role] || [];

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside className={`portal-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${ROLE_COLORS[role]}, var(--gold-dark))`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐾</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--white)' }}>HOOOMANS</div>
            <div style={{ fontSize: 10, color: ROLE_COLORS[role], fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '6px 20px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>Navigation</div>
        {links.map(link => (
          <RNavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${role}`}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: 17 }}>{link.icon}</span>
            <span>{link.label}</span>
          </RNavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
          <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${ROLE_COLORS[role]}, var(--gold-dark))`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#FCA5A5', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >🚪 Sign Out</button>
      </div>
    </aside>
  );
}
