import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const STATUSES = ['packed', 'shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?status=${filter}&page=${page}&limit=15`);
      setOrders(res.data.orders);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      load();
      setSelectedOrder(null);
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>Order Management</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Manage all customer orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => { setFilter(''); setPage(1); }} className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-ghost'}`} style={{ color: filter ? 'rgba(255,255,255,0.6)' : '', border: filter ? '1px solid rgba(255,255,255,0.12)' : '' }}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize', color: filter !== s ? 'rgba(255,255,255,0.6)' : '', border: filter !== s ? '1px solid rgba(255,255,255,0.12)' : '' }}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 38, borderRadius: 6 }} /></td></tr>)
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)' }}>No orders found</td></tr>
            ) : orders.map(o => (
              <tr key={o._id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>#{o._id?.toString().slice(-8).toUpperCase()}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.customer?.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{o.customer?.email}</div>
                </td>
                <td style={{ fontWeight: 700 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                <td><OrderStatusBadge status={o.status} /></td>
                <td><OrderStatusBadge status={o.paymentStatus} /></td>
                <td style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <button onClick={() => setSelectedOrder(o)} className="btn btn-ghost btn-sm" style={{ color: 'var(--gold)', border: '1px solid rgba(242,165,26,0.3)' }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setPage(pg)} style={{ width: 35, height: 35, borderRadius: 8, border: 'none', background: pg === page ? 'var(--gold)' : 'rgba(255,255,255,0.07)', color: pg === page ? 'var(--text-on-gold)' : 'rgba(255,255,255,0.6)', fontWeight: pg === page ? 700 : 400, cursor: 'pointer' }}>{pg}</button>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="modal modal-dark" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--white)', fontSize: 17 }}>Order #{selectedOrder._id?.toString().slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 12px' }}>Customer</h4>
                <p style={{ margin: 0, color: 'var(--white)', fontWeight: 600 }}>{selectedOrder.customer?.name}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{selectedOrder.customer?.email}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 12px' }}>Current Status</h4>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 12px' }}>Update Status</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selectedOrder._id, s)} disabled={s === selectedOrder.status} className="btn btn-sm" style={{ textTransform: 'capitalize', background: s === selectedOrder.status ? 'rgba(242,165,26,0.2)' : 'rgba(255,255,255,0.07)', border: s === selectedOrder.status ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: s === selectedOrder.status ? 'var(--gold)' : 'rgba(255,255,255,0.7)', cursor: s === selectedOrder.status ? 'default' : 'pointer' }}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
