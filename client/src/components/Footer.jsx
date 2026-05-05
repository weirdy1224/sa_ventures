import { Link } from 'react-router-dom';
import hoomansLogo from '../assets/hoomans_img.png';

const FOOTER_LINKS = {
  'Shop': [
    { label: 'All Products', to: '/products' },
    { label: 'Fur enhancement', to: '/products?category=fur-enhancement' },
    { label: 'Reduce Shedding', to: '/products?category=reduce-shedding' },
    { label: 'Bone / Joint Health', to: '/products?category=bone-joint-health' },
    { label: 'Tick Prevention', to: '/products?category=tick-prevention' },
    { label: 'Hydration', to: '/products?category=hydration-electrolyte' },
  ],
  'Account': [
    { label: 'My Account', to: '/account' },
    { label: 'Order History', to: '/account' },
    { label: 'Wishlist', to: '/account' },
    { label: 'Sign In', to: '/login' },
  ],
  'Support': [
    { label: 'Contact Us', to: '#' },
    { label: 'FAQs', to: '#' },
    { label: 'Returns & Refunds', to: '#' },
    { label: 'Delivery Info', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.75)', marginTop: 80 }}>
      <div className="container" style={{ padding: '60px 24px 40px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src={hoomansLogo} alt="Hooomans Logo" style={{ height: '70px', width: 'auto', display: 'block' }} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              India's premium pet products store. We believe every pet deserves the best — and so does their human.
            </p>
            {/* Newsletter */}
            <div style={{ display: 'flex', gap: 0 }}>
              <input type="email" placeholder="Your email address" style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--white)', fontSize: 13, outline: 'none', minWidth: 0 }} />
              <button style={{ padding: '10px 18px', background: 'var(--gold)', color: 'var(--text-on-gold)', border: 'none', borderRadius: '0 8px 8px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>Subscribe</button>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 16, fontSize: 14, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}> {new Date().getFullYear()} S&A Ventures · HOOOMANS. All rights reserved.</p>
          <div className="footer-policies" style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Shipping Policy'].map(t => (
              <a key={t} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >{t}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .footer-policies { flex-wrap: wrap; gap: 12px; }
        }
      `}</style>
    </footer>
  );
}
