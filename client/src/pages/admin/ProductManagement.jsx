import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const PET_CATEGORIES = [
  { value: 'fur-enhancement', label: 'Fur enhancement / Skin & Coat' },
  { value: 'reduce-shedding', label: 'Reduce Shedding Supplements' },
  { value: 'bone-joint-health', label: 'Bone / Joint Health Tablets' },
  { value: 'tick-prevention', label: 'Tick Prevention Tablets (Oral)' },
  { value: 'hydration-electrolyte', label: 'Hydration / Electrolyte Tablets' },
];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', discount: 0, isFeatured: false });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?search=${search}&limit=50&sort=-createdAt`);
      setProducts(res.data.products);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', price: '', stock: '', category: '', discount: 0, isFeatured: false }); setFiles([]); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, discount: p.discount || 0, isFeatured: p.isFeatured || false }); setFiles([]); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('images', f));

      if (editing) {
        await api.patch(`/products/${editing._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deactivated'); load(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Product Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{products.length} products</p>
        </div>
        <button onClick={openCreate} id="add-product-btn" className="btn btn-primary">+ Add Product</button>
      </div>

      {/* Search */}
      <input type="text" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} className="form-input dark-input" style={{ marginBottom: 20, maxWidth: 400 }} />

      {/* Table */}
      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 40, borderRadius: 6 }} /></td></tr>
              ))
            ) : products.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={p.images?.[0] || 'https://via.placeholder.com/44'} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.discount > 0 ? `${p.discount}% OFF` : 'No discount'}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-grey" style={{ textTransform: 'capitalize' }}>{PET_CATEGORIES.find(c => c.value === p.category)?.label || p.category}</span></td>
                <td>{formatPrice(p.price)}</td>
                <td>
                  <span style={{ color: p.stock === 0 ? 'var(--accent-red)' : p.stock <= 10 ? '#F59E0B' : 'var(--accent-green)', fontWeight: 700 }}>
                    {p.stock}
                  </span>
                </td>
                <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" style={{ color: 'var(--gold)', border: '1px solid rgba(242,165,26,0.3)' }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-ghost btn-sm" style={{ color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal modal-dark" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18 }}>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--white)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input dark-input" /></div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Category *</label>
                    <select
                      required
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="form-input form-select dark-input"
                    >
                      <option value="">Select a category...</option>
                      {PET_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>Price (₹) *</label><input required type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="form-input dark-input" /></div>
                  <div className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>Stock *</label><input required type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="form-input dark-input" /></div>
                  <div className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>Discount %</label><input type="number" min={0} max={100} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="form-input dark-input" /></div>
                  <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                      Featured Product
                    </label>
                  </div>
                </div>
                <div className="form-group"><label className="form-label" style={{ color: 'var(--text-secondary)' }}>Description *</label><textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input dark-input form-textarea" rows={3} /></div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Product Images</label>
                  <button type="button" onClick={() => fileRef.current.click()} style={{ padding: '12px 20px', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 10, background: 'var(--white)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, width: '100%' }}>
                    📷 {files.length ? `${files.length} file(s) selected` : 'Click to upload images'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setFiles(Array.from(e.target.files))} />
                  {editing?.images?.length > 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{editing.images.length} existing image(s) — new uploads will be appended</div>}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTopColor: 'rgba(255,255,255,0.07)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
