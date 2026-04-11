import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('monthly');
  const [exporting, setExporting] = useState(false);

  useEffect(() => { api.get(`/analytics?range=${range}`).then(r => setData(r.data)).catch(() => {}); }, [range]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await api.get(`/analytics/export?format=${format}&range=${range}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hooomans-report-${range}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (_) { toast.error('Export failed'); }
    setExporting(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>Analytics & Reports</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Store performance metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['daily', 'weekly', 'monthly'].map(r => (
            <button key={r} onClick={() => setRange(r)} className={`btn btn-sm ${r === range ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize', color: r !== range ? 'rgba(255,255,255,0.55)' : '', border: r !== range ? '1px solid rgba(255,255,255,0.12)' : '' }}>{r}</button>
          ))}
          <button onClick={() => handleExport('pdf')} disabled={exporting} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>📄 PDF</button>
          <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>📊 CSV</button>
        </div>
      </div>

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { icon: '💰', label: 'Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}` },
            { icon: '🧾', label: 'Orders', value: data.totalOrders || 0 },
            { icon: '👥', label: 'New Customers', value: data.newCustomers || 0 },
            { icon: '📦', label: 'Top Category', value: data.topProducts?.[0]?.name || '—' },
          ].map(s => (
            <div key={s.label} className="card-dark" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue by period table */}
      {data?.revenueData?.length > 0 && (
        <div className="card-dark table-wrapper">
          <table className="data-table">
            <thead><tr><th>Period</th><th>Revenue</th><th>Orders</th></tr></thead>
            <tbody>
              {data.revenueData.map(r => (
                <tr key={r._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r._id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{(r.revenue || 0).toLocaleString('en-IN')}</td>
                  <td>{r.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!data && <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>Loading analytics...</div>}

      <style>{`@media (max-width: 768px) { div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
