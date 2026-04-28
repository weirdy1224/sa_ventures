import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = ['grooming', 'food', 'accessories', 'toys', 'health', 'clothing', 'beds', 'training', 'travel'];
const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', page);
      params.set('limit', 12);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (_) {}
    setLoading(false);
  }, [search, category, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: '0 0 6px' }}>
          {search ? `Search: "${search}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{pagination.total} products found</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
        {/* Sidebar Filters */}
        <aside>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Filters</h3>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} style={{ accentColor: 'var(--gold)' }} />
                  All Categories
                </label>
                {(categories.length ? categories : CATEGORIES).map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="cat" checked={category === cat} onChange={() => setParam('category', cat)} style={{ accentColor: 'var(--gold)' }} />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Price Range</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Min" defaultValue={minPrice} onBlur={e => setParam('minPrice', e.target.value)} className="form-input" style={{ flex: 1 }} />
                <input type="number" placeholder="Max" defaultValue={maxPrice} onBlur={e => setParam('maxPrice', e.target.value)} className="form-input" style={{ flex: 1 }} />
              </div>
            </div>

            <button onClick={() => setSearchParams({})} className="btn btn-ghost w-full" style={{ border: '1px solid var(--grey-200)', fontSize: 13 }}>Clear Filters</button>
          </div>
        </aside>

        {/* Products Grid */}
        <div>
          {/* Sort Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: 'var(--white)', padding: '12px 16px', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Showing {products.length} of {pagination.total} results</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sort:</label>
              <select value={sort} onChange={e => setParam('sort', e.target.value)} className="form-input form-select" style={{ width: 'auto', fontSize: 13, padding: '6px 32px 6px 10px', height: 36 }}>
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <h3>No products found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setParam('page', pg)} style={{ width: 38, height: 38, borderRadius: 8, border: pg === page ? 'none' : '1px solid var(--grey-200)', background: pg === page ? 'var(--gold)' : 'var(--white)', color: pg === page ? 'var(--text-on-gold)' : 'var(--text-primary)', fontWeight: pg === page ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '240px 1fr'"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
          aside { display: none; }
        }
        @media (max-width: 500px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
