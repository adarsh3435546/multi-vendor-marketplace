import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';
import {
  ShieldCheckIcon, ZapIcon, StarIcon, UsersIcon, MapPinIcon,
  PhoneIcon, MailIcon, CheckCircleIcon, ArrowRightIcon, ClockIcon,
} from '../components/Icons';

const team = [
  { name: 'Verified Professionals', desc: 'Every service provider goes through identity verification and background checks before being listed on our platform.', Icon: ShieldCheckIcon },
  { name: 'Transparent Pricing', desc: 'No hidden charges. Your price is calculated upfront and locked for 15 minutes — what you see is what you pay.', Icon: ZapIcon },
  { name: 'Quality Guarantee', desc: 'Unsatisfied with the service? Your payment stays in escrow until you personally confirm the job is done right.', Icon: StarIcon },
  { name: 'Local Experts', desc: 'We connect you with skilled professionals who operate in your city and understand your local needs.', Icon: MapPinIcon },
  { name: 'Instant Booking', desc: 'Skip the calls and waiting. Browse, quote, and book a professional in under 3 minutes from anywhere.', Icon: ClockIcon },
  { name: 'Dedicated Support', desc: 'Our support team is available to help you at every step — from booking to completion.', Icon: UsersIcon },
];

export function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '7rem 0 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 800px 400px at 50% 30%, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="hero-badge" style={{ margin: '0 auto 1.75rem', display: 'inline-flex' }}>
              <ShieldCheckIcon size={14} color="var(--primary-300)" />
              Trusted by homeowners across India
            </div>
            <h1 style={{ marginBottom: '1.25rem', maxWidth: 700, margin: '0 auto 1.25rem' }}>
              We're building the most{' '}
              <span className="text-gradient">trustworthy home services</span>{' '}
              platform in India
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 620, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              Servicify was founded with a simple mission: make booking a reliable home service as easy as ordering food — with the same confidence that the job will be done right.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Join the Platform <ArrowRightIcon size={18} color="#fff" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="container section-padding">
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title">Why customers choose Servicify</h2>
            <p className="section-subtitle">Built around the things that matter most to you</p>
          </div>
        </FadeInSection>

        <StaggerContainer className="grid grid-3">
          {team.map(({ name, desc, Icon }) => (
            <StaggerItem key={name}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color="var(--primary-400)" />
                </div>
                <h4 style={{ fontWeight: 700 }}>{name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Stats */}
      <FadeInSection>
        <section style={{ padding: '4rem 0', background: 'rgba(14,19,36,0.4)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container">
            <StaggerContainer className="grid grid-4">
              {[
                { value: '10,000+', label: 'Bookings completed', Icon: CheckCircleIcon },
                { value: '98%', label: 'Satisfaction rate', Icon: StarIcon },
                { value: '500+', label: 'Verified providers', Icon: UsersIcon },
                { value: '20+', label: 'Cities covered', Icon: MapPinIcon },
              ].map(({ value, label, Icon }) => (
                <StaggerItem key={label}>
                  <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <Icon size={28} color="var(--primary-400)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{value}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </FadeInSection>

      {/* Contact */}
      <section className="container section-padding">
        <FadeInSection>
          <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '3rem 2.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Get in touch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Have a question, want to partner with us, or need support? We're here for you.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a
                href="mailto:hello@servicify.in"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', fontWeight: 600, fontSize: '0.925rem' }}
              >
                <MailIcon size={18} color="var(--primary-400)" />
                hello@servicify.in
              </a>
              <a
                href="tel:+911800000000"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', fontWeight: 600, fontSize: '0.925rem' }}
              >
                <PhoneIcon size={18} color="var(--primary-400)" />
                1800-000-0000 (Toll-free)
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
