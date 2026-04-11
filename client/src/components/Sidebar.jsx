import { NavLink as RNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ name }) => {
  const icons = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    products: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    orders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
    analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    promotions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
    reviews: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  };
  return icons[name] || null;
};

const ADMIN_LINKS = [
  { icon: <Icon name="dashboard" />, label: 'Dashboard', to: '/admin' },
  { icon: <Icon name="products" />, label: 'Products', to: '/admin/products' },
  { icon: <Icon name="orders" />, label: 'Orders', to: '/admin/orders' },
  { icon: <Icon name="analytics" />, label: 'Analytics', to: '/admin/analytics' },
  { icon: <Icon name="users" />, label: 'Users', to: '/admin/staff' },
  { icon: <Icon name="promotions" />, label: 'Promotions', to: '/admin/banners' },
  { icon: <Icon name="reviews" />, label: 'Reviews', to: '/admin/reviews' },
];

const STAFF_LINKS = [
  { icon: <Icon name="dashboard" />, label: 'Dashboard', to: '/staff' },
  { icon: <Icon name="users" />, label: 'Delivery Persons', to: '/staff/delivery-persons' },
  { icon: <Icon name="analytics" />, label: 'Payments', to: '/staff/payments' },
  { icon: <Icon name="reviews" />, label: 'Reviews', to: '/staff/reviews' },
];

const DELIVERY_LINKS = [
  { icon: <Icon name="dashboard" />, label: 'My Dashboard', to: '/delivery' },
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
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, color: 'var(--white)', letterSpacing: '-0.5px' }}>HOOOMANS</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{ROLE_LABELS[role]}</div>
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
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}>{link.icon}</span>
            <span>{link.label}</span>
          </RNavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {role === 'admin' && (
          <RNavLink to="/admin/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}><Icon name="settings" /></span>
            <span>Settings</span>
          </RNavLink>
        )}
        <button className="sidebar-item" onClick={handleLogout} style={{ width: 'calc(100% - 24px)', textAlign: 'left', background: 'none', border: 'none', outline: 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}><Icon name="logout" /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
