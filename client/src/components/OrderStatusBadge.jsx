const STATUS_CONFIG = {
  packed:          { label: 'Packed',            color: '#2563EB', bg: 'rgba(59,130,246,0.12)',  icon: '' },
  shipped:         { label: 'Shipped',           color: '#7C3AED', bg: 'rgba(139,92,246,0.12)',  icon: '' },
  nearest_hub:     { label: 'At Nearest Hub',    color: '#D97706', bg: 'rgba(245,158,11,0.12)',  icon: '' },
  yet_to_deliver:  { label: 'Out for Delivery',  color: '#DC2626', bg: 'rgba(239,68,68,0.12)',   icon: '' },
  delivered:       { label: 'Delivered',         color: '#059669', bg: 'rgba(16,185,129,0.12)',  icon: '' },
  pending:         { label: 'Pending',           color: '#D97706', bg: 'rgba(245,158,11,0.12)',  icon: '' },
  paid:            { label: 'Paid',              color: '#059669', bg: 'rgba(16,185,129,0.12)',  icon: '' },
  failed:          { label: 'Failed',            color: '#DC2626', bg: 'rgba(239,68,68,0.12)',   icon: '' },
  refunded:        { label: 'Refunded',          color: '#4F46E5', bg: 'rgba(99,102,241,0.12)',  icon: '️' },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: '•' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      borderRadius: '99px', fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
      background: config.bg, color: config.color,
    }}>
      <span style={{ fontSize: 11 }}>{config.icon}</span> {config.label}
    </span>
  );
}
