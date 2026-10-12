import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { HomeIcon, WrenchIcon, EyeIcon, EyeOffIcon, BadgeCheckIcon } from '../components/Icons';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'ADMIN') {
      setError('This registration type is not available publicly.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await register(formData);
      setSuccessMessage('Account created! Taking you to sign in…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '2rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card auth-card"
        style={{ maxWidth: 520 }}
      >
        <div className="auth-header">
          <span className="auth-icon"><BadgeCheckIcon size={28} color="var(--primary-400)" /></span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join as a customer or become a service provider</p>
        </div>

        {successMessage && <Alert type="success" message={successMessage} />}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="form">
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">I want to join as</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-option-card ${formData.role === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
              >
                <span className="role-icon"><HomeIcon size={22} color="var(--primary-400)" /></span>
                <div>
                  <strong>Customer</strong>
                  <p>Book home and commercial services</p>
                </div>
              </button>

              <button
                type="button"
                className={`role-option-card ${formData.role === 'VENDOR' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'VENDOR' })}
              >
                <span className="role-icon"><WrenchIcon size={22} color="var(--primary-400)" /></span>
                <div>
                  <strong>Service Provider</strong>
                  <p>Offer services and grow your business</p>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              {formData.role === 'VENDOR' ? 'Business / Trading Name' : 'Full Name'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder={formData.role === 'VENDOR' ? 'e.g. Swift Home Repairs' : 'e.g. Ravi Kumar'}
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Mobile number <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Create password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {formData.password.length > 0 && (
              <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.25rem' }}>
                {[...Array(4)].map((_, i) => {
                  const strength = formData.password.length >= 6 ? (formData.password.length >= 8 ? (formData.password.length >= 10 ? 4 : 3) : 2) : 1;
                  return (
                    <div
                      key={i}
                      style={{
                        height: 3, flex: 1, borderRadius: 2,
                        background: i < strength
                          ? strength === 1 ? 'var(--danger-400)' : strength === 2 ? 'var(--warning-400)' : strength === 3 ? 'var(--info-400)' : 'var(--success-400)'
                          : 'var(--border-default)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  );
                })}
              </div>
            )}
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
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
