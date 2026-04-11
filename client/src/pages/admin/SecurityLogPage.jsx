import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function SecurityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/security-log').then(r => setLogs(r.data.logs || [])).finally(() => setLoading(false)); }, []);

  const ACTION_COLORS = {
    login: 'var(--accent-blue)',
    logout: 'rgba(255,255,255,0.4)',
    failed_login: 'var(--accent-red)',
    register: 'var(--accent-green)',
    password_change: 'var(--gold)',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--white)', fontSize: 20, fontWeight: 700 }}>Security Log</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Audit trail of all auth events</p>
      </div>
      <div className="card-dark table-wrapper">
        <table className="data-table">
          <thead><tr><th>Action</th><th>User</th><th>IP Address</th><th>User Agent</th><th>Timestamp</th></tr></thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 36 }} /></td></tr>)
              : logs.map(l => (
                <tr key={l._id}>
                  <td><span style={{ padding: '3px 10px', borderRadius: 99, background: `${ACTION_COLORS[l.action] || 'rgba(255,255,255,0.2)'}20`, color: ACTION_COLORS[l.action] || 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 12 }}>{l.action?.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontSize: 13 }}>{l.user?.email || l.user?.name || '—'}</td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{l.ip}</td>
                  <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.userAgent}</td>
                  <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
