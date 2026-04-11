import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import OrderStatusBadge from '../../components/OrderStatusBadge';

export default function PaymentDetails() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/razorpay?limit=50').then(r => setPayments(r.data.payments || [])).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Payment Records</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>All transaction history</p>
      </div>
      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment Status</th><th>Razorpay ID</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 36 }} /></td></tr>)
              : payments.map(p => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: 'var(--gold)' }}>#{p._id?.toString().slice(-8).toUpperCase()}</td>
                  <td style={{ fontSize: 14 }}>{p.customer?.name || '—'}</td>
                  <td style={{ fontWeight: 700 }}>₹{p.totalAmount?.toLocaleString('en-IN')}</td>
                  <td><OrderStatusBadge status={p.paymentStatus} /></td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.razorpayPaymentId || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
