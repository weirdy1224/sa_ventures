import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, cartTotal, removeFromCart, setQuantity, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    if (!user) {
      toast('Please log in to checkout', { icon: '' });
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }} />}

      {/* Drawer */}
      <div className="cart-drawer-panel" style={{
        position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: 'var(--white)',
        zIndex: 600, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--grey-100)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Your Cart</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{cart.items?.length || 0} items</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, background: 'var(--grey-100)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!cart.items?.length ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}></div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Your cart is empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start shopping to add items</p>
              <Link to="/products" onClick={onClose} className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Shop Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.items.map((item, i) => {
                const p = item.productId;
                const price = p?.salePrice || p?.price || 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--grey-100)' }}>
                    <img src={p?.images?.[0] || 'https://placehold.co/64x64?text=P'} alt={p?.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.name || 'Product'}</p>
                      <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-secondary)' }}>{formatPrice(price)} each</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--grey-200)', borderRadius: 8, overflow: 'hidden' }}>
                          <button onClick={() => setQuantity(p?._id, item.quantity - 1)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
                          <span style={{ padding: '4px 8px', fontSize: 13, fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => setQuantity(p?._id, item.quantity + 1)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{formatPrice(price * item.quantity)}</span>
                          <button onClick={() => deleteItem(p?._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: 16 }}></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items?.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--grey-100)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--navy)' }}>{formatPrice(cartTotal)}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>Taxes and delivery calculated at checkout</p>
            <button onClick={handleCheckout} className="btn btn-primary btn-lg w-full btn-round">Proceed to Checkout →</button>
            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>Clear cart</button>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 480px) { .cart-drawer-panel { width: 100vw !important; } }`}</style>
    </>
  );
}
