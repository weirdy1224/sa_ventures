import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#031C2E' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(242,165,26,0.2)', borderTopColor: '#F2A51A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
