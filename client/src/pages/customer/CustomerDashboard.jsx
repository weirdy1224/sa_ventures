import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordRes, wishRes] = await Promise.all([api.get('/orders/customer/mine'), api.get('/wishlist')]);
        setOrders(ordRes.data.orders);
        setWishlist(wishRes.data.wishlist);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const TABS = [
    { key: 'orders', label: '📋 My Orders' },
    { key: 'wishlist', label: '❤️ Wishlist' },
    { key: 'profile', label: '👤 Profile' },
    { key: 'addresses', label: '📍 Addresses' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>My Account</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Welcome back, {user?.name}! 🐾</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--grey-200)', marginBottom: 32, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, borderBottom: `2.5px solid ${t.key === tab ? 'var(--gold)' : 'transparent'}`, marginBottom: -2, color: t.key === tab ? 'var(--gold-dark)' : 'var(--text-secondary)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>{t.label}</button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div>
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />)
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 60 }}>📭</div>
              <h3>No orders yet</h3>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => (
                <div key={order._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Order #{order._id?.toString().slice(-8).toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.products?.length} item(s)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <OrderStatusBadge status={order.status} />
                      <Link to={`/orders/${order._id}/track`} className="btn btn-outline btn-sm">Track</Link>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {order.products?.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.imageUrl || item.productId?.images?.[0] || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    ))}
                    {order.products?.length > 4 && <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>+{order.products.length - 4}</div>}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 16 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist */}
      {tab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 60 }}>🤍</div>
              <h3>Your wishlist is empty</h3>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Products</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {wishlist.map(p => (
                <Link key={p._id} to={`/products/${p._id}`} className="card card-hover" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <img src={p.images?.[0] || 'https://via.placeholder.com/200'} alt={p.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>₹{(p.salePrice || p.price).toLocaleString('en-IN')}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="card" style={{ padding: 28, maxWidth: 520 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>Profile Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label className="form-label">Full Name</label><p style={{ margin: 0, fontWeight: 600 }}>{user?.name}</p></div>
            <div className="form-group"><label className="form-label">Email</label><p style={{ margin: 0 }}>{user?.email}</p></div>
            <div className="form-group"><label className="form-label">Phone</label><p style={{ margin: 0 }}>{user?.phone || 'Not set'}</p></div>
            <div className="form-group"><label className="form-label">Role</label><span className="badge badge-blue">{user?.role}</span></div>
            <div className="form-group"><label className="form-label">Member Since</label><p style={{ margin: 0 }}>{new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p></div>
          </div>
        </div>
      )}

      {/* Addresses */}
      {tab === 'addresses' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {user?.addresses?.map(addr => (
              <div key={addr._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700 }}>{addr.label}</span>
                  {addr.isDefault && <span className="badge badge-gold">Default</span>}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />{addr.city}, {addr.state} – {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          div[style*="repeat(4, 1fr)"], div[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
