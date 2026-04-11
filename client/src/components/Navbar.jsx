import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All Products', to: '/products' },
  { label: 'Food & Treats', to: '/products?category=food' },
  { label: 'Accessories', to: '/products?category=accessories' },
  { label: 'Grooming', to: '/products?category=grooming' },
  { label: 'Toys', to: '/products?category=toys' },
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
        <div style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', padding: '7px 16px', letterSpacing: 0.3 }}>
          🐾 Free delivery on orders above ₹499 · Use code <strong style={{ color: 'var(--gold)' }}>FIRSTPET</strong> for 10% off your first order
        </div>

        {/* Main header */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 24px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: 'var(--shadow-gold)' }}>
              🐾
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--navy)', lineHeight: 1 }}>HOOOMANS</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase' }}>S&A Ventures</div>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
            <input
              id="search-input"
              type="text"
              placeholder="Search for pet food, toys, grooming..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingRight: 48, borderRadius: 'var(--radius-full)', border: '1.5px solid var(--grey-200)', background: 'var(--grey-50)', height: 44 }}
            />
            <button type="submit" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius-full)', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🔍
            </button>
          </form>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Cart */}
            <button id="cart-btn" onClick={() => setCartOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 10, borderRadius: 10, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--grey-100)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 22 }}>🛒</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--gold)', color: 'var(--text-on-gold)', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button id="user-menu-btn" onClick={() => setUserMenu(!userMenu)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid var(--grey-200)', borderRadius: 'var(--radius-full)', padding: '7px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--grey-200)'}
              >
                <span style={{ fontSize: 18 }}>👤</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--grey-400)' }}>▼</span>
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
        <nav style={{ borderTop: '1px solid var(--grey-100)', background: 'var(--cream)', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex', gap: 0, padding: '0 24px' }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} label={link.label} />
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

function NavLink({ to, label }) {
  return (
    <Link to={to} style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.2s', display: 'block' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-dark)'; e.currentTarget.style.borderBottomColor = 'var(--gold)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderBottomColor = 'transparent'; }}
    >
      {label}
    </Link>
  );
}
