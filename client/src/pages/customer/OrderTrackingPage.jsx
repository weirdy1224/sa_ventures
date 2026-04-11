import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const STEPS = [
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'nearest_hub', label: 'Nearest Hub', icon: '🏪' },
  { key: 'yet_to_deliver', label: 'Out for Delivery', icon: '🏃' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join:order', id);
    socket.on('order:status:update', (data) => {
      if (data.orderId === id) setOrder(o => ({ ...o, status: data.status }));
    });
    return () => { socket.emit('leave:order', id); socket.off('order:status:update'); };
  }, [socket, id]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>;
  if (!order) return <div style={{ padding: 60, textAlign: 'center' }}>Order not found</div>;

  const currentIdx = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Track Order</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Order #{order._id?.toString().slice(-8).toUpperCase()}</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Stepper */}
      <div className="card" style={{ padding: '32px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
          {STEPS.map((step, idx) => {
            const isDone = idx < currentIdx;
            const isActive = idx === currentIdx;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step.key} style={{ flex: idx === STEPS.length - 1 ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Line */}
                {!isLast && (
                  <div style={{ position: 'absolute', top: 20, left: '50%', width: '100%', height: 3, background: isDone ? 'var(--gold)' : 'var(--grey-200)', transition: 'background 0.5s', zIndex: 0 }} />
                )}
                {/* Dot */}
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: isDone ? 'var(--gold)' : isActive ? 'var(--navy)' : 'var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', zIndex: 1, boxShadow: isActive ? '0 0 0 6px rgba(3,28,46,0.12)' : 'none', transition: 'all 0.4s' }}>
                  {step.icon}
                </div>
                {/* Label */}
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: isDone ? 'var(--gold-dark)' : isActive ? 'var(--navy)' : 'var(--grey-400)', textAlign: 'center', maxWidth: 80 }}>{step.label}</div>
                {/* Status history timestamp */}
                {(isDone || isActive) && order.statusHistory?.find(h => h.status === step.key) && (
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 2 }}>
                    {new Date(order.statusHistory.find(h => h.status === step.key).changedAt).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>📍 Delivery Address</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {order.address?.line1}{order.address?.line2 ? `, ${order.address.line2}` : ''}<br />
            {order.address?.city}, {order.address?.state} – {order.address?.pincode}
          </p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>📅 Delivery Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ordered On</span>
              <span style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Expected Delivery</span>
              <span style={{ fontWeight: 600, color: order.expectedDelivery ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString('en-IN') : 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>🛍️ Order Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {order.products?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--grey-100)' }}>
              <img src={item.imageUrl || 'https://via.placeholder.com/56'} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Qty: {item.quantity}</p>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>₹{((item.priceAtPurchase || 0) * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--navy)', fontSize: 18 }}>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Proof of delivery photos */}
      {order.photos?.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📸 Proof of Delivery</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {order.photos.map((url, i) => <img key={i} src={url} alt="Proof" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />)}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
