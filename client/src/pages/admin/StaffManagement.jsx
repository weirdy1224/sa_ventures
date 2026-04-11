import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); const r = await api.get('/staff').catch(() => ({ data: { staff: [] } })); setStaff(r.data.staff); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.post('/staff', form); toast.success('Staff account created & credentials emailed!'); setShowModal(false); setForm({ name: '', email: '', password: '' }); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this staff account?')) return;
    try { await api.delete(`/staff/${id}`); toast.success('Staff deactivated'); load(); }
    catch (_) { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Staff Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{staff.length} staff members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Staff</button>
      </div>

      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 36 }} /></td></tr>)
              : staff.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--navy)', fontSize: 14 }}>{s.name?.[0]}</div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {s.isActive && <button onClick={() => handleDeactivate(s._id)} className="btn btn-ghost btn-sm" style={{ color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>Deactivate</button>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal modal-dark" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 17 }}>Create Staff Account</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--white)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(242,165,26,0.08)', border: '1px solid rgba(242,165,26,0.2)', borderRadius: 8, padding: 12 }}>
                  💡 Login credentials will be automatically emailed to the staff member.
                </p>
                {[['name', 'Full Name', 'text'], ['email', 'Email Address', 'email'], ['password', 'Initial Password', 'password']].map(([key, label, type]) => (
                  <div key={key} className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{label} *</label>
                    <input required type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="form-input dark-input" />
                  </div>
                ))}
              </div>
              <div className="modal-footer" style={{ borderTopColor: 'rgba(255,255,255,0.07)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
