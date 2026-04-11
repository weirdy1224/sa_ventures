import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function DeliveryPersonManagement() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); const r = await api.get('/delivery-persons').catch(() => ({ data: { persons: [] } })); setPersons(r.data.persons); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.post('/delivery-persons', form); toast.success('Delivery person account created!'); setShowModal(false); setForm({ name: '', email: '', password: '' }); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>Delivery Team</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{persons.length} delivery personnel</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Delivery Person</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)
          : persons.map(p => (
            <div key={p._id} className="card-dark" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--accent-green), #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--white)', fontSize: 18 }}>{p.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--white)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.email}</div>
                </div>
              </div>
              <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal modal-dark" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--white)', fontSize: 17 }}>Add Delivery Person</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([k, l, t]) => (
                  <div key={k} className="form-group">
                    <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</label>
                    <input required type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="form-input dark-input" />
                  </div>
                ))}
              </div>
              <div className="modal-footer" style={{ borderTopColor: 'rgba(255,255,255,0.07)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 768px) { div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
