import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success('Account created! Welcome to HOOOMANS 🐾');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/">
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 10px', boxShadow: 'var(--shadow-gold)' }}>🐾</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, color: 'var(--white)', margin: 0 }}>HOOOMANS</h1>
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)', padding: '32px 36px' }}>
          <h2 style={{ color: 'var(--white)', fontSize: 20, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 24px', textAlign: 'center' }}>Join 10,000+ happy pet parents</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', required: true },
              { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
              { id: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', required: false },
              { id: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters', required: true },
              { id: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password', required: true },
            ].map(({ id, label, type, placeholder, required }) => (
              <div key={id} className="form-group">
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</label>
                <input id={id} type={type} required={required} placeholder={placeholder} className="form-input dark-input" value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))} />
              </div>
            ))}

            <button id="register-submit" type="submit" disabled={loading} className="btn btn-primary btn-lg btn-round w-full" style={{ marginTop: 6 }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
