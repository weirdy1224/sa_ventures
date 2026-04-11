import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const DELIVERY_STATUSES = ['shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'];

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const fileRef = useRef();
  const { user } = { user: null }; // will get from context

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join:order', id);
    socket.on('chat:message', (msg) => setChatMessages(m => [...m, msg]));
    socket.on('order:status:update', (data) => { if (data.orderId === id) setOrder(o => ({ ...o, status: data.status })); });
    return () => { socket.emit('leave:order', id); socket.off('chat:message'); socket.off('order:status:update'); };
  }, [socket, id]);

  const updateStatus = async (status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrder(o => ({ ...o, status }));
      toast.success('Status updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('orderId', id);
    fd.append('photo', photo);
    try {
      await api.post('/upload-photo/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Proof of delivery uploaded!');
      setPhoto(null);
    } catch (_) { toast.error('Upload failed'); }
    setUploading(false);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socket?.emit('chat:message', { orderId: id, message: chatInput, sender: 'delivery' });
    setChatMessages(m => [...m, { message: chatInput, sender: 'delivery', timestamp: new Date() }]);
    setChatInput('');
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
  if (!order) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Order not found</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>Order #{id?.slice(-8).toUpperCase()}</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
              📍 {order.address?.line1}, {order.address?.city}, {order.address?.state} – {order.address?.pincode}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Update */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>🔄 Update Status</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {DELIVERY_STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={s === order.status} style={{
                  padding: '10px 18px', borderRadius: 8, border: s === order.status ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.12)',
                  background: s === order.status ? 'rgba(242,165,26,0.15)' : 'rgba(255,255,255,0.05)',
                  color: s === order.status ? 'var(--gold)' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13, cursor: s === order.status ? 'default' : 'pointer', textTransform: 'capitalize',
                }}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Proof of Delivery */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>📸 Proof of Delivery</h3>
            <input type="file" accept="image/*" ref={fileRef} onChange={e => setPhoto(e.target.files[0])} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => fileRef.current.click()} style={{ padding: '11px 18px', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 10, background: photo ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', color: photo ? 'var(--accent-green)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {photo ? `✅ ${photo.name}` : '📷 Select Photo'}
              </button>
              {photo && <button onClick={uploadPhoto} disabled={uploading} className="btn btn-success">{uploading ? 'Uploading...' : '⬆️ Upload'}</button>}
            </div>
            {order.photos?.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {order.photos.map((url, i) => <img key={i} src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--grey-100)' }} />)}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>🛍️ Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.products?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--grey-100)' }}>
                  <img src={item.imageUrl || 'https://via.placeholder.com/44'} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>x{item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 480 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--grey-100)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>💬 Chat with Staff</h3>
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatMessages.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 13 }}>No messages yet...</p>}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'delivery' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '8px 14px', borderRadius: 12, background: m.sender === 'delivery' ? 'var(--gold)' : 'rgba(255,255,255,0.08)', color: m.sender === 'delivery' ? 'var(--text-on-gold)' : 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." className="form-input dark-input" style={{ flex: 1, fontSize: 13 }} />
            <button onClick={sendChat} style={{ padding: '10px 16px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: 'var(--text-on-gold)', cursor: 'pointer', fontWeight: 700 }}>Send</button>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="gridTemplateColumns: '1fr 340px'"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
