import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = [
  { name: 'Dogs', icon: '🐕', slug: 'dogs', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop' },
  { name: 'Cats', icon: '🐈', slug: 'cats', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop' },
  { name: 'Birds', icon: '🦜', slug: 'birds', image: 'https://images.unsplash.com/photo-1552728089-5710d345e691?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fish', icon: '🐠', slug: 'fish', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?q=80&w=600&auto=format&fit=crop' },
  { name: 'Small Pets', icon: '🐁', slug: 'small-pets', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd0bbd1?q=80&w=600&auto=format&fit=crop' },
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
      <section style={{ background: '#FDF7ED', minHeight: 560, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 40, width: '100%' }}>
          <div style={{ flex: 1, paddingRight: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', borderRadius: 99, padding: '8px 16px', marginBottom: 24, marginTop : 20 }}>
              <span style={{ color: '#B45309', fontSize: 13, fontWeight: 700 }}>🎉 Spring Sale - Up to 50% Off</span>
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 900, color: 'var(--navy)', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1px' }}>
              Everything Your<br />Pet Needs, All in<br />One Place
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
              Premium food, toys, grooming essentials, and healthcare products for dogs, cats, birds, and small pets.
            </p>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="/products" className="btn btn-primary btn-lg btn-round">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-secondary btn-lg btn-round">View Deals</Link>
            </div>
          </div>
          
          <div style={{ flex: 1, height: 480, position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800" 
              alt="Happy golden retriever" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px 40px 100px 40px', boxShadow: 'var(--shadow-xl)' }}
            />
          </div>
        </div>
      </section>

      {/* Shop by Pet */}
      <section style={{ padding: '64px 0' }} className="container">
        <SectionHeader title="Shop by Pet" subtitle="Find everything your furry, feathered, or finned friend needs" center={true} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 40 }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, aspectRatio: '1/1', background: 'var(--navy)', textDecoration: 'none', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 20, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.querySelector('img').style.transform = ''; }}
            >
              <img src={cat.image} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', opacity: 0.9 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ color: 'var(--white)', fontWeight: 800, fontSize: 16 }}>{cat.name}</div>
              </div>
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

      {/* Newsletter / Join Our Pack */}
      <section style={{ padding: '64px 0 0 0' }}>
        <div style={{ background: 'var(--navy)', width: '100%', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, marginBottom: 16 }}>
            Join Our Pack! 🐾
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40, maxWidth: 500 }}>
            Get exclusive deals, pet care tips, and updates delivered to your inbox
          </p>
          
          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500, margin: '0 auto', marginBottom: 24 }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              style={{ flex: 1, padding: '16px 24px', borderRadius: 'var(--radius-full)', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--white)', fontSize: 16, outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary btn-round" style={{ padding: '16px 36px', fontSize: 16 }}>
              Subscribe
            </button>
          </form>
          
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            🎁 Get 10% off your first order when you subscribe
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          section > div > div > div:has(h1) { paddingRight: 0; }
          section > div > div > img { display: none; }
          .container > div > div { flex-wrap: wrap; justify-content: center; }
          section > .container > div[style*="repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          section > .container > div[style*="repeat(6"] { grid-template-columns: repeat(2, 1fr) !important; }
          section > .container > div[style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
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
