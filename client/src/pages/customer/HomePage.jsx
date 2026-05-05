import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = [
  { name: 'Fur enhancement / Skin & Coat', icon: '', slug: 'fur-enhancement', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Reduce Shedding Supplements', icon: '', slug: 'reduce-shedding', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600&auto=format&fit=crop' },
  { name: 'Bone / Joint Health Tablets', icon: '', slug: 'bone-joint-health', image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=600&auto=format&fit=crop' },
  { name: 'Tick Prevention Tablets (Oral)', icon: '️', slug: 'tick-prevention', image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=600&auto=format&fit=crop' },
  { name: 'Hydration / Electrolyte Tablets', icon: '', slug: 'hydration-electrolyte', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sort=-createdAt&limit=4'),
        ]);
        setFeaturedProducts(featRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (_) { }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section style={{ background: '#FDF7ED', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
        <div className="container hero-inner" style={{ display: 'flex', alignItems: 'center', gap: 60, width: '100%' }}>
          <div className="hero-text" style={{ flex: 1, paddingRight: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', borderRadius: 99, padding: '8px 16px', marginBottom: 24, marginTop: 20 }}>
              <span style={{ color: '#B45309', fontSize: 13, fontWeight: 700 }}> Spring Sale - Up to 50% Off</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1px' }}>
              Everything Your<br />Pet Needs, All in<br />One Place
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
              Premium supplements and care essentials designed to enhance your pet's overall wellbeing—from skin and coat nourishment to joint strength, hydration, and parasite protection.
            </p>

            <div className="hero-cta" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-primary btn-lg btn-round">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-secondary btn-lg btn-round">View Deals</Link>
            </div>
          </div>

          <div className="hero-image-wrap" style={{ flex: 1.1, height: '70vh', minHeight: 500, maxHeight: 750, position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1200"
              alt="Happy golden retriever"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px 40px 100px 40px', boxShadow: 'var(--shadow-xl)' }}
            />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section style={{ padding: '64px 0' }} className="container section-padding">
        <SectionHeader title="Shop by Category" subtitle="Everything your pet needs, organized just for you" center={true} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 40 }}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="category-card"
              style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, aspectRatio: '16/9', background: 'var(--navy)', textDecoration: 'none', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.14)'; e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.querySelector('img').style.transform = ''; }}
            >
              <img src={cat.image} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', opacity: 0.85 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{cat.icon}</span>
                <div>
                  <div style={{ color: 'var(--white)', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{cat.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontWeight: 500 }}>Shop now →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Full-width Promo Banner */}
      <section style={{ background: '#F2A51A', padding: '24px 0' }}>
        <div className="container promo-banner-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 36, opacity: 0.9 }}></div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--white)', margin: '0 0 2px', letterSpacing: '-0.3px' }}>
                Flash Sale - Today Only!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 15, margin: 0, fontWeight: 500 }}>
                Up to 50% off on selected items.
              </p>
            </div>
          </div>
          <Link to="/products" className="btn btn-round" style={{ background: 'var(--white)', color: 'var(--gold)', fontSize: 15, padding: '14px 28px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = 'var(--white)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--gold-dark)'; }}>
            Shop Deals
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: '48px 0 64px', background: 'var(--cream-dark)' }} className="section-padding">
          <div className="container">
            <SectionHeader title="Best Sellers" subtitle="Most loved products by pet parents" action={{ label: 'View All', to: '/products?featured=true' }} />
            {loading ? (
              <div className="product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
              </div>
            ) : (
              <div className="product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
                {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '48px 0 80px' }} className="section-padding">
          <div className="container">
            <SectionHeader title="New Arrivals" subtitle="Just landed in store" action={{ label: 'Shop All', to: '/products?sort=-createdAt' }} />
            <div className="product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Features/Values Section */}
      <section style={{ borderBottom: '1px solid var(--grey-100)', padding: '56px 0', background: 'var(--white)' }} className="section-padding">
        <div className="container features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>Free Shipping</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>On orders over ₹500</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Premium Quality</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Trusted brands only</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Best Prices</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Guaranteed lowest prices</p>
          </div>
        </div>
      </section>

      {/* Newsletter / Join Our Pack */}
      <section style={{ padding: '64px 0 0 0' }}>
        <div style={{ background: 'var(--navy)', width: '100%', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
            Join Our Pack! 
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40, maxWidth: 500 }}>
            Get exclusive deals, pet care tips, and updates delivered to your inbox
          </p>

          <form onSubmit={e => e.preventDefault()} className="newsletter-form" style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500, margin: '0 auto', marginBottom: 24 }}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              style={{ flex: 1, padding: '16px 24px', borderRadius: 'var(--radius-full)', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--white)', fontSize: 16, outline: 'none', minWidth: 0 }}
            />
            <button type="submit" className="btn btn-primary btn-round" style={{ padding: '16px 32px', fontSize: 15, flexShrink: 0 }}>
              Subscribe
            </button>
          </form>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
             Get 10% off your first order when you subscribe
          </p>
        </div>
      </section>

      <style>{`
        .category-card { width: calc(33.333% - 14px); }
        @media (max-width: 1024px) {
          .hero-text h1 { font-size: 44px; }
        }
        @media (max-width: 768px) {
          .hero-inner { flex-direction: column !important; gap: 32px !important; }
          .hero-image-wrap { display: none !important; }
          .hero-text { text-align: center !important; padding-right: 0 !important; }
          .hero-cta { justify-content: center !important; }
          .category-card { width: calc(50% - 10px); }
        }
        @media (max-width: 640px) {
          .hero-text h1 { font-size: 32px !important; }
          .hero-text p { font-size: 15px !important; }
          .category-card { width: 100%; }
        }
        @media (max-width: 480px) {
          .hero-cta { flex-direction: column; }
          .hero-cta .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, subtitle, action, center }) {
  return (
    <div style={{ display: 'flex', alignItems: center ? 'center' : 'flex-end', justifyContent: center ? 'center' : 'space-between', flexWrap: 'wrap', gap: 12, textAlign: center ? 'center' : 'left' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</h2>
        {subtitle && <p style={{ margin: center ? '0 auto' : 0, color: 'var(--text-secondary)', fontSize: 15 }}>{subtitle}</p>}
      </div>
      {action && <Link to={action.to} style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>{action.label} →</Link>}
    </div>
  );
}
