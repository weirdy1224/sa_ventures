import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordRes, delRes] = await Promise.all([
          api.get(`/orders?status=${filter}&page=${page}&limit=15`),
          api.get('/delivery-persons'),
        ]);
        setOrders(ordRes.data.orders);
        setDeliveryPersons(delRes.data.persons);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [filter, page]);

  const handleAssign = async (orderId, userId) => {
    try {
      await api.patch(`/orders/${orderId}/assign-delivery/${userId}`);
      toast.success('Delivery person assigned!');
    } catch (_) { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Orders Dashboard</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Manage and assign orders</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--white)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20, border: '1px solid var(--grey-100)' }}>
        {['', 'packed', 'shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === s ? 'var(--gold)' : 'transparent', color: filter === s ? 'var(--text-on-gold)' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Assigned To</th><th>Expected</th><th>Assign</th></tr></thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 36 }} /></td></tr>)
              : orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--gold)' }}>#{o._id?.toString().slice(-8).toUpperCase()}</td>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{o.customer?.name}</td>
                  <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td style={{ fontSize: 13 }}>{o.assignedTo?.name || <span style={{ color: 'var(--text-secondary)' }}>Unassigned</span>}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <select onChange={e => handleAssign(o._id, e.target.value)} defaultValue="" style={{ background: 'var(--white)', border: '1px solid var(--grey-100)', borderRadius: 6, color: 'var(--text-secondary)', padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                      <option value="">Assign to...</option>
                      {deliveryPersons.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
