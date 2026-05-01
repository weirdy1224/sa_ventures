import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch { navigate('/products'); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAddToCart = () => { addToCart(product._id, qty); };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/wishlist', { productId: product._id });
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch (_) {}
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { productId: id, ...reviewForm });
      toast.success('Review submitted! It will appear after moderation.');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit review'); }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div className="skeleton" style={{ height: 480, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[120, 60, 100, 80, 200, 140].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 10 }} />)}
        </div>
      </div>
    </div>
  );
  if (!product) return null;

  const displayPrice = product.salePrice || product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="product-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-md)', aspectRatio: '1', marginBottom: 16 }}>
            <img src={product.images?.[activeImg] || 'https://placehold.co/600?text=HOOOMANS'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: 72, height: 72, padding: 0, border: `2px solid ${i === activeImg ? 'var(--gold)' : 'var(--grey-200)'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--cream-dark)', padding: '4px 10px', borderRadius: 99 }}>{product.category}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, margin: '12px 0 8px', lineHeight: 1.2, color: 'var(--text-primary)' }}>{product.name}</h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(product.averageRating) ? 'filled' : ''}`}>★</span>)}</div>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{product.averageRating} ({product.reviewCount} reviews)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{formatPrice(displayPrice)}</span>
            {product.discount > 0 && (
              <>
                <span style={{ fontSize: 20, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</span>
                <span className="badge badge-green">{product.discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOutOfStock ? (
              <span className="badge badge-red">Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="badge badge-orange">⚠️ Only {product.stock} left in stock</span>
            ) : (
              <span className="badge badge-green">✅ In Stock</span>
            )}
          </div>

          {/* Qty + Cart */}
          {!isOutOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--grey-200)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>−</button>
                <span style={{ padding: '10px 16px', fontWeight: 700, fontSize: 16, minWidth: 50, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>
              </div>
              <button onClick={handleAddToCart} id="add-to-cart-detail" className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: 160 }}>🛒 Add to Cart</button>
              <button onClick={handleWishlist} id="wishlist-btn" style={{ width: 48, height: 48, border: '1.5px solid var(--grey-200)', borderRadius: 10, background: 'none', cursor: 'pointer', fontSize: 22 }}>{inWishlist ? '❤️' : '🤍'}</button>
            </div>
          )}

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid var(--grey-100)', borderBottom: '1px solid var(--grey-100)', flexWrap: 'wrap' }}>
            {[['🚚', 'Free Delivery on ₹499+'], ['🔒', 'Secure Razorpay Payment'], ['↩️', '7-Day Easy Returns']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--grey-200)', marginBottom: 28 }}>
          {['description', 'reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, borderBottom: `2.5px solid ${t === tab ? 'var(--gold)' : 'transparent'}`, marginBottom: -2, color: t === tab ? 'var(--gold-dark)' : 'var(--text-secondary)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <div style={{ maxWidth: 720 }}>
            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 15 }}>{product.description}</p>
            {product.tags?.length > 0 && <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{product.tags.map(t => <span key={t} style={{ padding: '4px 12px', background: 'var(--cream-dark)', borderRadius: 99, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>#{t}</span>)}</div>}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            {product.reviews?.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first!</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, marginBottom: 32 }}>
              {product.reviews?.map(r => (
                <div key={r._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.customer?.name || 'Customer'}</div>
                      <div className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= r.rating ? 'filled' : ''}`}>★</span>)}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {r.comment && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>}
                </div>
              ))}
            </div>

            {user?.role === 'customer' && (
              <div className="card" style={{ padding: 24, maxWidth: 520 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Write a Review</h3>
                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="form-label">Rating</label>
                    <div className="stars" style={{ gap: 6, fontSize: 28, cursor: 'pointer' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ cursor: 'pointer', color: s <= reviewForm.rating ? 'var(--gold)' : 'var(--grey-300)' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Share your experience..." className="form-input form-textarea" />
                  <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 480px) {
          .product-detail-layout { gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
