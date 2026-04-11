import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { label: '🐶 Dogs', to: '/products?category=dogs' },
  { label: '🐱 Cats', to: '/products?category=cats' },
  { label: '🐦 Birds', to: '/products?category=birds' },
  { label: '🐟 Fish', to: '/products?category=fish' },
  { label: '🐹 Small Pets', to: '/products?category=small-pets' },
  { label: '⚡ Flash Sale', to: '/products?featured=true', isFlash: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const portalLink = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : user?.role === 'delivery' ? '/delivery' : null;

  return (
    <>
      <header style={{ background: 'var(--white)', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', justifyContent: 'center', padding: '8px 24px' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 0 }}>
            <div>
              🐾 Free Shipping on Orders Over $50!
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="/delivery" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Delivery Portal</Link>
              <Link to="/staff" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Staff</Link>
              <Link to="/admin" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Admin</Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 24px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, color: 'var(--navy)', letterSpacing: '-0.5px' }}>HOOOMANS</div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', fontSize: 18 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search for products, brands, or pets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 44, paddingRight: 16, borderRadius: 'var(--radius-full)', border: '1px solid var(--grey-100)', background: 'var(--grey-50)', height: 44, fontSize: 15 }}
            />
          </form>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {/* Wishlist */}
            <Link to="/account" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </Link>

            {/* Cart */}
            <button id="cart-btn" onClick={() => setCartOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-primary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--gold)', color: 'var(--text-on-gold)', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button id="user-menu-btn" onClick={() => setUserMenu(!userMenu)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '4px', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </button>

              {userMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--grey-100)', minWidth: 200, padding: 8, zIndex: 300, animation: 'scaleIn 0.15s ease' }}>
                  {user ? (
                    <>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--grey-100)', marginBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                        <span className={`badge badge-${user.role === 'customer' ? 'blue' : 'gold'}`} style={{ marginTop: 4 }}>{user.role}</span>
                      </div>
                      {user.role === 'customer' && <MenuItem to="/account" icon="📋" label="My Account" onClick={() => setUserMenu(false)} />}
                      {portalLink && <MenuItem to={portalLink} icon="⚙️" label="Dashboard" onClick={() => setUserMenu(false)} />}
                      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, color: 'var(--accent-red)', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >🚪 Sign Out</button>
                    </>
                  ) : (
                    <>
                      <MenuItem to="/login" icon="🔑" label="Sign In" onClick={() => setUserMenu(false)} />
                      <MenuItem to="/register" icon="✨" label="Create Account" onClick={() => setUserMenu(false)} />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 6 }} className="mobile-menu-btn">☰</button>
          </div>
        </div>

        {/* Category nav */}
        <nav style={{ borderTop: '1px solid var(--white)', background: '#FDF7ED', overflowX: 'auto', borderBottom: '1px solid var(--grey-100)' }}>
          <div className="container" style={{ display: 'flex', gap: 12, padding: '0 24px' }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.label} to={link.to} label={link.label} isFlash={link.isFlash} />
            ))}
          </div>
        </nav>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}

function MenuItem({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--grey-50)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <span>{icon}</span>{label}
    </Link>
  );
}

function NavLink({ to, label, isFlash }) {
  return (
    <Link to={to} style={{ padding: '14px 16px', fontSize: 14, fontWeight: isFlash ? 700 : 500, color: isFlash ? 'var(--gold-dark)' : 'var(--text-primary)', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.2s', display: 'block' }}
      onMouseEnter={e => { e.currentTarget.style.color = isFlash ? 'var(--gold-dark)' : 'var(--text-secondary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = isFlash ? 'var(--gold-dark)' : 'var(--text-primary)'; }}
    >
      {label}
    </Link>
  );
}
