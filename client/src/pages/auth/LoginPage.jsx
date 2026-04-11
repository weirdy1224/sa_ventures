import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_DASHBOARDS = { admin: '/admin', staff: '/staff', delivery: '/delivery', customer: '/' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🐾`);
      navigate(ROLE_DASHBOARDS[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(242,165,26,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(242,165,26,0.05)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px', boxShadow: 'var(--shadow-gold)' }}>🐾</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--white)', margin: '0 0 4px' }}>HOOOMANS</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>S&A Ventures</p>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)', padding: '36px 40px' }}>
          <h2 style={{ color: 'var(--white)', fontSize: 22, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>Sign In</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px', textAlign: 'center' }}>Welcome back — enter your details</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Email Address</label>
              <input id="email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="form-input dark-input" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <a href="#" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>Forgot password?</a>
              </label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Your password" className="form-input dark-input" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn btn-primary btn-lg btn-round w-full" style={{ marginTop: 8 }}>
              {loading ? (
                <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--text-on-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Google OAuth */}
          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <a href="/api/auth/google" className="btn w-full" style={{ background: 'var(--white)', color: 'var(--text-primary)', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 600, gap: 10, justifyContent: 'center', display: 'flex', alignItems: 'center', padding: '11px 20px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </a>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
