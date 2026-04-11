import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); const r = await api.get('/reviews/pending').catch(() => ({ data: { reviews: [] } })); setReviews(r.data.reviews || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const moderate = async (id, status) => {
    try { await api.patch(`/reviews/${id}/approve`, { status }); toast.success(`Review ${status}`); load(); }
    catch (_) { toast.error('Action failed'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>Review Moderation</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{reviews.length} pending review(s)</p>
      </div>
      {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />)
        : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 48 }}>⭐</div>
            <h3 style={{ color: 'var(--white)' }}>No pending reviews</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(r => (
              <div key={r._id} className="card-dark" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--white)', marginRight: 10 }}>{r.customer?.name}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>on {r.product?.name}</span>
                  </div>
                  <div>{'⭐'.repeat(r.rating)}</div>
                </div>
                {r.comment && <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>"{r.comment}"</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => moderate(r._id, 'approved')} className="btn btn-success btn-sm">✓ Approve</button>
                  <button onClick={() => moderate(r._id, 'rejected')} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
