export default function StatsCard({ icon, label, value, trend, trendLabel, color = 'var(--gold)' }) {
  const isPositive = trend >= 0;
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</p>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{value}</h2>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <span style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 13, fontWeight: 700 }}>
                {isPositive ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
