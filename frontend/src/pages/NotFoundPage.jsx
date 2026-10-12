import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ArrowRightIcon } from '../components/Icons';

export function NotFoundPage() {
  return (
    <div className="flex-center" style={{ minHeight: '70vh', padding: '3rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', maxWidth: 500 }}
      >
        {/* 404 SVG illustration */}
        <div style={{ marginBottom: '2rem' }}>
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
            {/* Left 4 */}
            <text x="0" y="90" fontSize="90" fontWeight="900" fontFamily="Inter, sans-serif" fill="url(#grad404)" opacity="0.15">404</text>
            <defs>
              <linearGradient id="grad404" x1="0" y1="0" x2="180" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <text x="0" y="90" fontSize="90" fontWeight="900" fontFamily="Inter, sans-serif" fill="none" stroke="url(#grad404)" strokeWidth="1.5">404</text>
            {/* Magnifying glass */}
            <circle cx="140" cy="35" r="20" stroke="rgba(99,102,241,0.4)" strokeWidth="3" fill="rgba(99,102,241,0.05)" />
            <line x1="154" y1="49" x2="164" y2="59" stroke="rgba(99,102,241,0.4)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="140" cy="35" r="8" stroke="rgba(99,102,241,0.2)" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or may have been moved. Head back to the homepage to find what you need.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <HomeIcon size={18} color="#fff" />
            Back to Home
          </Link>
          <Link to="/services" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Browse Services
            <ArrowRightIcon size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
