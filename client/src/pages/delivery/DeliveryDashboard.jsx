import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import OrderStatusBadge from '../../components/OrderStatusBadge';

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders/my');
        const o = res.data.orders;
        setOrders(o);
        setStats({
          total: o.length,
          active: o.filter(x => x.status !== 'delivered').length,
          delivered: o.filter(x => x.status === 'delivered').length,
        });
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>My Deliveries</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>All orders assigned to you</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📦', label: 'Total Assigned', value: stats.total, color: 'var(--gold)' },
          { icon: '🚚', label: 'Active', value: stats.active, color: 'var(--accent-blue)' },
          { icon: '✅', label: 'Delivered', value: stats.delivered, color: 'var(--accent-green)' },
        ].map(s => (
          <div key={s.label} className="card-dark" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders */}
      {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />)
        : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: 'var(--white)' }}>No deliveries assigned</h3>
            <p>Check back soon for new assignments.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <Link key={o._id} to={`/delivery/orders/${o._id}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(242,165,26,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ width: 48, height: 48, background: 'rgba(242,165,26,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>Order #{o._id?.toString().slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    📍 {o.address?.line1}, {o.address?.city}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <OrderStatusBadge status={o.status} />
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>›</div>
              </Link>
            ))}
          </div>
        )}

      <style>{`@media (max-width: 640px) { div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
