import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SocialCallback() {
  const [searchParams] = useSearchParams();
  const { setSocialToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setSocialToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(242,165,26,0.2)', borderTopColor: '#F2A51A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
