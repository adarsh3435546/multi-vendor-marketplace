import React from 'react';
import { Link } from 'react-router-dom';
import { FadeInSection } from './AnimatedSection';
import { ZapIcon, ShieldCheckIcon, MailIcon, PhoneIcon } from './Icons';

const footerLinks = {
  Platform: [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'About Us', to: '/about' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Create Account', to: '/register' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Refund Policy', to: '/' },
  ],
};

export function Footer() {
  return (
    <footer className="footer">
      <FadeInSection>
        <div className="container">
          {/* Top section */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none' }}>
                <ZapIcon size={20} color="var(--primary-400)" />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Servicify</span>
              </Link>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280, marginBottom: '1.5rem' }}>
                India's trusted platform for booking verified home service professionals — with transparent pricing and secure escrow payments.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="mailto:hello@servicify.in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.825rem', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  <MailIcon size={14} color="currentColor" />
                  hello@servicify.in
                </a>
                <a href="tel:+911800000000" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.825rem', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  <PhoneIcon size={14} color="currentColor" />
                  1800-000-0000 (Toll-free)
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                  {group}
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              © {new Date().getFullYear()} Servicify Technologies Pvt. Ltd. All rights reserved.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <ShieldCheckIcon size={14} color="var(--success-400)" />
              <span>Payments protected by escrow</span>
            </div>
          </div>
        </div>
      </FadeInSection>
    </footer>
  );
}
