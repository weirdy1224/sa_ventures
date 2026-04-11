import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = [
  { name: 'Food & Treats', icon: '🍖', slug: 'food' },
  { name: 'Accessories', icon: '🎀', slug: 'accessories' },
  { name: 'Grooming', icon: '✂️', slug: 'grooming' },
  { name: 'Toys', icon: '🎾', slug: 'toys' },
  { name: 'Health & Care', icon: '💊', slug: 'health' },
  { name: 'Beds & Housing', icon: '🏠', slug: 'beds' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes, bannerRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sort=-createdAt&limit=4'),
          api.get('/banners'),
        ]);
        setFeaturedProducts(featRes.data.products);
        setNewArrivals(newRes.data.products);
        setBanners(bannerRes.data.banners);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  // Auto-cycle banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div>
      {/* Hero Banner */}
      <section style={{ position: 'relative', background: 'var(--navy)', overflow: 'hidden', minHeight: 480 }}>
        {banners.length > 0 ? (
          <div style={{ position: 'relative', height: 480 }}>
            {banners.map((b, i) => (
              <div key={b._id} style={{ position: 'absolute', inset: 0, opacity: i === bannerIdx ? 1 : 0, transition: 'opacity 0.8s ease', pointerEvents: i === bannerIdx ? 'auto' : 'none' }}>
                <img src={b.imageUrl} alt={b.title || 'Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,28,46,0.85) 0%, rgba(3,28,46,0.3) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-50%)' }}>
                  {b.title && <h1 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1, maxWidth: 500 }}>{b.title}</h1>}
                  {b.subtitle && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, margin: '0 0 28px', maxWidth: 400 }}>{b.subtitle}</p>}
                  {b.linkUrl && <Link to={b.linkUrl} className="btn btn-primary btn-lg btn-round">Shop Now 🐾</Link>}
                </div>
              </div>
            ))}
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)} style={{ width: i === bannerIdx ? 24 : 8, height: 8, borderRadius: 99, background: i === bannerIdx ? 'var(--gold)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
              ))}
            </div>
          </div>
        ) : (
          /* Default hero */
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 480, padding: '60px 80px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(242,165,26,0.1) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(242,165,26,0.15)', border: '1px solid rgba(242,165,26,0.3)', borderRadius: 99, padding: '6px 14px', marginBottom: 20 }}>
                <span>🐾</span>
                <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>India's #1 Pet Products Store</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, color: 'var(--white)', lineHeight: 1.05, margin: '0 0 16px' }}>
                Everything Your<br /><span style={{ color: 'var(--gold)' }}>Pet Deserves</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.6, marginBottom: 32, maxWidth: 440 }}>
                Premium food, accessories, grooming essentials — curated for the most discerning pet parents in India.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-primary btn-lg btn-round">Shop All Products 🛒</Link>
                <Link to="/products?featured=true" className="btn btn-outline btn-lg btn-round" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--white)' }}>Featured Items</Link>
              </div>
              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
                {[['🚚', 'Free Delivery', '₹499+'], ['↩️', 'Easy Returns', '7 Days'], ['🔒', 'Secure Payments', 'Razorpay'], ['⭐', 'Premium Quality', 'Curated']].map(([icon, title, sub]) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>{title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section style={{ padding: '64px 0' }} className="container">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what your pet needs" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginTop: 32 }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s', textAlign: 'center', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = ''; }}
            >
              <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--cream), var(--cream-dark))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cat.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: '48px 0 64px', background: 'var(--cream-dark)' }}>
          <div className="container">
            <SectionHeader title="⭐ Featured Products" subtitle="Handpicked by our team" action={{ label: 'View All', to: '/products?featured=true' }} />
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
                {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', borderRadius: 'var(--radius-xl)', padding: '48px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, background: 'rgba(242,165,26,0.07)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: 60, bottom: -80, width: 200, height: 200, background: 'rgba(242,165,26,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(242,165,26,0.15)', border: '1px solid rgba(242,165,26,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 12 }}>🎉 FIRST ORDER OFFER</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--white)', margin: '0 0 10px' }}>Get 10% off your first order</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, margin: 0 }}>Use code <strong style={{ color: 'var(--gold)' }}>FIRSTPET</strong> at checkout. Min. order ₹299.</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg btn-round" style={{ flexShrink: 0 }}>Claim Offer →</Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '0 0 80px' }}>
          <div className="container">
            <SectionHeader title="🆕 New Arrivals" subtitle="Just landed in store" action={{ label: 'Shop All', to: '/products?sort=-createdAt' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 1024px) {
          section > .container > div[style*="repeat(6"] { grid-template-columns: repeat(3, 1fr) !important; }
          section > .container > div[style*="repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="padding: '60px 80px'"] { padding: 40px !important; }
        }
        @media (max-width: 640px) {
          section > .container > div[style*="repeat(6"] { grid-template-columns: repeat(2, 1fr) !important; }
          section > .container > div[style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>{subtitle}</p>}
      </div>
      {action && <Link to={action.to} style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>{action.label} →</Link>}
    </div>
  );
}
