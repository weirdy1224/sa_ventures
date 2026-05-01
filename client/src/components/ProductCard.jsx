import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;
  const displayPrice = product.salePrice || product.price;

  return (
    <div className="card card-hover" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image */}
      <Link to={`/products/${product._id}`} style={{ display: 'block', position: 'relative', paddingBottom: '75%', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={product.images?.[0] || 'https://placehold.co/400x300?text=HOOOMANS'}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isOutOfStock && <span className="badge badge-red">Out of Stock</span>}
          {isLowStock && !isOutOfStock && <span className="badge badge-orange">Low Stock</span>}
          {product.discount > 0 && <span className="badge badge-green">{product.discount}% OFF</span>}
          {product.isFeatured && <span className="badge badge-gold">Featured</span>}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
        {/* Category */}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{product.category}</span>

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}
            onMouseEnter={e => e.target.style.color = 'var(--gold-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
          >{product.name}</h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="stars">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`star ${s <= Math.round(product.averageRating) ? 'filled' : ''}`} style={{ fontSize: 13 }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{formatPrice(displayPrice)}</span>
          {product.discount > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          id={`add-to-cart-${product._id}`}
          onClick={() => addToCart(product._id)}
          disabled={isOutOfStock}
          className="btn btn-primary w-full"
          style={{ marginTop: 6, borderRadius: 8, fontSize: 13 }}
        >
          {isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}
