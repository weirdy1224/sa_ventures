import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatsCard from '../../components/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#F2A51A', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics?range=${range}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [range]);

  if (loading) return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 22, fontWeight: 700 }}>Overview</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Store performance at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
          {['daily', 'weekly', 'monthly'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: r === range ? 'var(--gold)' : 'transparent', color: r === range ? 'var(--text-on-gold)' : 'rgba(255,255,255,0.55)', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <StatsCard icon="💰" label="Total Revenue" value={formatPrice(data?.totalRevenue || 0)} color="var(--gold)" />
        <StatsCard icon="🧾" label="Total Orders" value={data?.totalOrders || 0} color="var(--accent-blue)" />
        <StatsCard icon="👥" label="New Customers" value={data?.newCustomers || 0} color="var(--accent-green)" />
        <StatsCard icon="⭐" label="Top Product Revenue" value={formatPrice(data?.topProducts?.[0]?.revenue || 0)} color="var(--accent-purple)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card-dark" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', color: 'var(--white)', fontSize: 15, fontWeight: 700 }}>Revenue Trend</h3>
          {data?.revenueData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="_id" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#0A2E47', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} formatter={v => [formatPrice(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: 'var(--gold)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No data for selected period</div>
          )}
        </div>

        {/* Top Products Pie */}
        <div className="card-dark" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', color: 'var(--white)', fontSize: 15, fontWeight: 700 }}>Top Products</h3>
          {data?.topProducts?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.topProducts} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {data.topProducts.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [formatPrice(v), 'Revenue']} contentStyle={{ background: '#0A2E47', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {data.topProducts.map((p, i) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.sales} sold</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No sales data yet</div>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="card-dark" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--white)', fontSize: 15, fontWeight: 700 }}>Orders by Status</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(data?.orderStats || []).map(s => (
            <div key={s._id} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{s._id?.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="2fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
