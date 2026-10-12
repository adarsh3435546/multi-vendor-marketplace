import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, GridIcon, InfoIcon, UserIcon, LogOutIcon,
  MenuIcon, XIcon, ChevronDownIcon, ZapIcon, SettingsIcon,
} from './Icons';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Public nav links — always visible
  const publicLinks = [
    { to: '/', label: 'Home', Icon: HomeIcon },
    { to: '/services', label: 'Services', Icon: GridIcon },
    { to: '/about', label: 'About Us', Icon: InfoIcon },
  ];

  // Dashboard link changes by role
  const dashboardLink =
    user?.role === 'VENDOR'
      ? { to: '/vendor/dashboard', label: 'My Workspace', Icon: ZapIcon }
      : user?.role === 'ADMIN'
      ? { to: '/admin/dashboard', label: 'Admin', Icon: SettingsIcon }
      : user?.role === 'CUSTOMER'
      ? { to: '/customer/dashboard', label: 'My Bookings', Icon: GridIcon }
      : null;

  const isActive = (path) => location.pathname === path;

  const roleColors = {
    CUSTOMER: 'var(--info-400)',
    VENDOR: 'var(--primary-400)',
    ADMIN: 'var(--warning-400)',
  };

  return (
    <>
      <header
        className="navbar"
        style={scrolled ? { background: 'rgba(6,8,15,0.92)', borderBottomColor: 'rgba(99,102,241,0.15)' } : {}}
      >
        <div className="container nav-container">

          {/* Brand */}
          <Link to="/" className="brand-logo">
            <ZapIcon size={22} color="var(--primary-400)" strokeWidth={2.2} style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
            <span className="brand-name">Servicify</span>
            <span className="brand-badge">Beta</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links">
            {publicLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className="nav-link"
                style={isActive(to) ? { color: 'var(--text-primary)' } : {}}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Icon size={15} />
                  {label}
                </span>
                {isActive(to) && (
                  <motion.span
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute', bottom: 4, left: '20%',
                      width: '60%', height: 2,
                      background: 'linear-gradient(90deg, var(--primary-500), var(--accent-400))',
                      borderRadius: 99,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {isAuthenticated && dashboardLink && (
              <Link
                to={dashboardLink.to}
                className="nav-link"
                style={isActive(dashboardLink.to) ? { color: 'var(--text-primary)' } : {}}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <dashboardLink.Icon size={15} />
                  {dashboardLink.label}
                </span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Side */}
          <div className="nav-actions">
            {isAuthenticated ? (
              /* Profile Dropdown */
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    background: profileOpen ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${profileOpen ? 'rgba(99,102,241,0.25)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.5rem 0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-primary)',
                  }}
                  aria-label="Open profile menu"
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--primary-600), #7c3aed)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: roleColors[user.role] || 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {user.role === 'CUSTOMER' ? 'Customer' : user.role === 'VENDOR' ? 'Provider' : 'Admin'}
                    </div>
                  </div>
                  <motion.span
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', color: 'var(--text-tertiary)' }}
                  >
                    <ChevronDownIcon size={14} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                        width: 220,
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                        overflow: 'hidden',
                        zIndex: 10000,
                      }}
                    >
                      {/* Profile header */}
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(99,102,241,0.03)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{user.email}</div>
                      </div>

                      <div style={{ padding: '0.375rem' }}>
                        {dashboardLink && (
                          <Link
                            to={dashboardLink.to}
                            onClick={() => setProfileOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.625rem',
                              padding: '0.625rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <dashboardLink.Icon size={16} />
                            {dashboardLink.label}
                          </Link>
                        )}

                        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0.375rem 0.75rem' }} />

                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            width: '100%', padding: '0.625rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--danger-400)', fontSize: '0.875rem', fontWeight: 500,
                            transition: 'all 0.15s ease', textAlign: 'left',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <LogOutIcon size={16} color="var(--danger-400)" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <UserIcon size={15} />
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <XIcon size={24} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <MenuIcon size={24} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(6,8,15,0.96)',
              backdropFilter: 'blur(20px)',
              zIndex: 999,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', width: '100%', padding: '0 2rem' }}
            >
              {[...publicLinks, ...(isAuthenticated && dashboardLink ? [dashboardLink] : [])].map(({ to, label, Icon }) => (
                <motion.div key={to} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ width: '100%' }}>
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      color: isActive(to) ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive(to) ? 'rgba(99,102,241,0.1)' : 'transparent',
                      fontWeight: 600, fontSize: '1rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '1rem' }}
              >
                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.875rem 1.5rem', borderRadius: 'var(--radius-lg)',
                        background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                        color: 'var(--danger-400)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem',
                      }}
                    >
                      <LogOutIcon size={20} color="var(--danger-400)" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link to="/login" className="btn btn-outline btn-lg" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center', display: 'flex' }}>
                      Sign In
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-lg" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center', display: 'flex' }}>
                      Get Started — It's Free
                    </Link>
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
