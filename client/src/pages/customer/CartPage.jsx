import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CartPage() {
  const { cart, cartTotal, setQuantity, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');

  if (!cart.items?.length) return (
    <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Start exploring our premium pet products!</p>
        <Link to="/products" className="btn btn-primary btn-lg btn-round">Shop Now 🐾</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, margin: 0 }}>Shopping Cart</h1>
        <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>🗑 Clear Cart</button>
      </div>

      <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {cart.items.map((item, i) => {
            const p = item.productId;
            const price = p?.salePrice || p?.price || 0;
            return (
              <div key={i} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid var(--grey-100)', alignItems: 'center' }}>
                <img src={p?.images?.[0] || 'https://placehold.co/96x96?text=P'} alt={p?.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{p?.name}</h3>
                  <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: 13 }}>{formatPrice(price)} per item</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', border: '1px solid var(--grey-200)', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => setQuantity(p?._id, item.quantity - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>−</button>
                      <span style={{ padding: '6px 12px', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => setQuantity(p?._id, item.quantity + 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
                    </div>
                    <button onClick={() => deleteItem(p?._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Remove</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>{formatPrice(price * item.quantity)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Order Summary</h2>

            {/* Coupon */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
              <input type="text" placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} className="form-input" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }} />
              <button style={{ padding: '10px 16px', background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '0 8px 8px 0', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Apply</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--grey-100)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                <span style={{ color: 'var(--accent-green)' }}>{cartTotal >= 499 ? 'FREE' : formatPrice(60)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
                {formatPrice(cartTotal >= 499 ? cartTotal : cartTotal + 60)}
              </span>
            </div>

            <button onClick={() => user ? navigate('/checkout') : navigate('/login')} className="btn btn-primary btn-lg w-full btn-round">
              {user ? 'Proceed to Checkout →' : 'Login to Checkout →'}
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>← Continue Shopping</Link>

            <div style={{ marginTop: 20, padding: 14, background: 'var(--grey-50)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>🔒 Secure payment powered by Razorpay</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .cart-item-row { flex-direction: column; gap: 12px; }
          .cart-item-row img { width: 72px; height: 72px; }
        }
      `}</style>
    </div>
  );
}
