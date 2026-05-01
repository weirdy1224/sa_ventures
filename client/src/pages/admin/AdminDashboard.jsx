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
      <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
      <div className="admin-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>Overview</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Store performance at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: 0, background: 'var(--portal-card-bg, var(--white))', borderRadius: 10, padding: 4, border: '1px solid var(--portal-border, var(--grey-100))', boxShadow: 'var(--shadow-sm)' }}>
          {['daily', 'weekly', 'monthly'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: r === range ? 'var(--gold)' : 'transparent', color: r === range ? 'var(--white)' : 'var(--portal-text-secondary, var(--text-secondary))', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <StatsCard icon="💰" label="Total Revenue" value={formatPrice(data?.totalRevenue || 0)} color="var(--gold)" />
        <StatsCard icon="🧾" label="Total Orders" value={data?.totalOrders || 0} color="var(--accent-blue)" />
        <StatsCard icon="👥" label="New Customers" value={data?.newCustomers || 0} color="var(--accent-green)" />
        <StatsCard icon="⭐" label="Top Product Revenue" value={formatPrice(data?.topProducts?.[0]?.revenue || 0)} color="var(--accent-purple)" />
      </div>

      {/* Charts */}
      <div className="admin-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>Revenue Trend</h3>
          {data?.revenueData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" />
                <XAxis dataKey="_id" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--portal-card-bg, var(--white))', border: '1px solid var(--portal-border, var(--grey-200))', borderRadius: 8, color: 'var(--portal-text-primary, var(--text-primary))', boxShadow: 'var(--shadow-sm)' }} itemStyle={{ color: 'var(--portal-text-primary, var(--text-primary))' }} formatter={v => [formatPrice(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: 'var(--gold)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>No data for selected period</div>
          )}
        </div>

        {/* Top Products Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>Top Products</h3>
          {data?.topProducts?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.topProducts} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {data.topProducts.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [formatPrice(v), 'Revenue']} contentStyle={{ background: 'var(--portal-card-bg, var(--white))', border: '1px solid var(--portal-border, var(--grey-200))', borderRadius: 8, color: 'var(--portal-text-primary, var(--text-primary))', boxShadow: 'var(--shadow-sm)' }} itemStyle={{ color: 'var(--portal-text-primary, var(--text-primary))' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {data.topProducts.map((p, i) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.sales} sold</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>No sales data yet</div>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}>Orders by Status</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(data?.orderStats || []).map(s => (
            <div key={s._id} style={{ padding: '12px 20px', background: 'var(--portal-input-bg, var(--grey-50))', borderRadius: 10, border: '1px solid var(--portal-border, var(--grey-100))' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--portal-text-primary, var(--text-primary))', fontFamily: 'var(--font-display)' }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'var(--portal-text-secondary, var(--text-secondary))', textTransform: 'capitalize' }}>{s._id?.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .admin-chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .admin-kpi-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .admin-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
