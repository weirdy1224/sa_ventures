import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({
    code: '',
    discountPercentage: '',
    maxUses: '',
    expiresAt: '',
    isActive: true
  });

  const loadCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.coupons);
    } catch (_) {
      toast.error('Failed to load coupons');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/coupons/${editId}`, form);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', form);
        toast.success('Coupon created');
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditId(coupon._id);
      setForm({
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        maxUses: coupon.maxUses,
        expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
        isActive: coupon.isActive
      });
    } else {
      setEditId(null);
      setForm({ code: '', discountPercentage: '', maxUses: '', expiresAt: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (_) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Promotions</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>Manage coupons and promotional campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <span>+</span> Create Coupon
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ margin: 0 }}>No coupons found. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {coupons.map(c => {
            const isExpired = new Date() > new Date(c.expiresAt) || !c.isActive || c.currentUses >= c.maxUses;
            const progress = Math.min((c.currentUses / c.maxUses) * 100, 100);
            
            return (
              <div key={c._id} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(242,165,26,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 24, flexShrink: 0 }}>
                    🏷️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{c.code}</h2>
                      <span className={`badge ${isExpired ? 'badge-grey' : 'badge-green'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.discountPercentage}% off</span>
                      <span style={{ color: 'var(--portal-border)' }}>•</span>
                      <span>Used {c.currentUses}/{c.maxUses}</span>
                      <span style={{ color: 'var(--portal-border)' }}>•</span>
                      <span>Expires {new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <button onClick={() => openModal(c)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Edit</button>
                    <button onClick={() => handleDelete(c._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Delete</button>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, background: 'var(--portal-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="modal" style={{ padding: 24, borderRadius: 12, width: '100%', maxWidth: 400 }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Coupon Code</label>
                <input required type="text" className="form-input" placeholder="e.g. SUMMER50" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Discount %</label>
                  <input required type="number" min="1" max="100" className="form-input" value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Max Uses</label>
                  <input required type="number" min="1" className="form-input" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Expiry Date</label>
                <input required type="date" className="form-input" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="isActive" style={{ fontSize: 14 }}>Coupon is active</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
