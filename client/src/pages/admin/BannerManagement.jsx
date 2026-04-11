import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', linkUrl: '', isActive: true });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = async () => { const r = await api.get('/banners').catch(() => ({ data: { banners: [] } })); setBanners(r.data.banners); };
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try { await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Banner created!'); setShowModal(false); setFile(null); setForm({ title: '', subtitle: '', linkUrl: '', isActive: true }); load(); }
    catch (_) { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Banner deleted'); load(); }
    catch (_) { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Banner Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Manage homepage carousel banners</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Banner</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {banners.map(b => (
          <div key={b._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', paddingBottom: '45%' }}>
              <img src={b.imageUrl} alt={b.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{b.title}</div>
                {b.subtitle && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.subtitle}</div>}
              </div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge ${b.isActive ? 'badge-green' : 'badge-red'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => handleDelete(b._id)} className="btn btn-ghost btn-sm" style={{ color: '#FCA5A5' }}>Delete</button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>No banners yet. Create your first one!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal modal-dark" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 17 }}>Create Banner</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--white)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['title', 'Title'], ['subtitle', 'Subtitle'], ['linkUrl', 'Link URL (optional)']].map(([k, l]) => (
                  <div key={k} className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>{l}</label><input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="form-input dark-input" /></div>
                ))}
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Banner Image *</label>
                  <button type="button" onClick={() => fileRef.current.click()} style={{ padding: '12px', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 10, background: 'var(--white)', color: file ? 'var(--accent-green)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', width: '100%', fontSize: 14 }}>
                    {file ? `✅ ${file.name}` : '📷 Upload Banner Image'}
                  </button>
                  <input type="file" accept="image/*" ref={fileRef} onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTopColor: 'rgba(255,255,255,0.07)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Create Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 768px) { div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
