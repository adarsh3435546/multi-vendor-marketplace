import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { UserIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [needRoleChoice, setNeedRoleChoice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('session_expired');

  React.useEffect(() => {
    if (sessionExpired) {
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const userData = await login(email, password, role || undefined);

      if (userData.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('multiple accounts')) {
        setNeedRoleChoice(true);
        setError('This email has both a Customer and a Provider account with the same password. Choose which one to open:');
      } else {
        setError(msg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card auth-card"
      >
        <div className="auth-header">
          <span className="auth-icon"><UserIcon size={28} color="var(--primary-400)" /></span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage your bookings and services</p>
        </div>

        {sessionExpired && (
          <Alert type="warning" message="Your session has expired. Please sign in again." />
        )}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {needRoleChoice && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {[['CUSTOMER', 'Customer'], ['VENDOR', 'Service Provider']].map(([r, label]) => (
              <button
                key={r}
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError('');
                    setNeedRoleChoice(false);
                    const userData = await login(email, password, r);
                    if (userData.role === 'VENDOR') navigate('/vendor/dashboard');
                    else if (userData.role === 'ADMIN') navigate('/admin/dashboard');
                    else navigate('/customer/dashboard');
                  } catch (err) {
                    setError(err.message || 'Invalid email or password. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: '1rem',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'center' }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinRotate 0.8s linear infinite', display: 'inline-block' }} />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here?{' '}
            <Link to="/register" className="auth-link">Create a free account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
