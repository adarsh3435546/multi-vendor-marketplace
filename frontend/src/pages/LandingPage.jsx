import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { servicesApi } from '../api/services';
import { pricingApi } from '../api/pricing';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { ServiceIcon } from '../components/ServiceIcon';
import { SearchIcon, WrenchIcon, StarIcon, TagIcon, CreditCardIcon, CheckCircleIcon } from '../components/Icons';
import { FadeInSection, HeroText, StaggerContainer, StaggerItem } from '../components/AnimatedSection';


export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteScheduledAt, setQuoteScheduledAt] = useState('');
  const [quoteUrgency, setQuoteUrgency] = useState('NORMAL');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getActiveServices();
      setServices(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load services. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuote = (service) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'CUSTOMER') {
      navigate('/login');
      return;
    }
    setSelectedService(service);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setQuoteScheduledAt(tomorrow.toISOString().slice(0, 16));
    setQuoteUrgency('NORMAL');
    setQuoteResult(null);
    setQuoteError('');
    setBookingSuccess('');
    setIsQuoteModalOpen(true);
  };

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    try {
      setQuoteLoading(true);
      setQuoteError('');
      const formattedDate = new Date(quoteScheduledAt).toISOString();
      const quote = await pricingApi.getQuote(selectedService.id, formattedDate, quoteUrgency);
      setQuoteResult(quote);
    } catch (err) {
      setQuoteError(err.message || 'Could not calculate a price quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!quoteResult) return;
    try {
      setBookingLoading(true);
      setQuoteError('');
      await bookingsApi.createBooking(quoteResult.quoteId);
      setBookingSuccess('Your booking is confirmed! Redirecting to your dashboard…');
      setTimeout(() => {
        setIsQuoteModalOpen(false);
        navigate('/customer/dashboard');
      }, 1800);
    } catch (err) {
      setQuoteError(err.message || 'Booking could not be completed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.vendorBusinessName && s.vendorBusinessName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="landing-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="container hero-container">

          <HeroText delay={0}>
            <div className="hero-badge">
              <span className="pulse-dot" />
              Services available now in your area
            </div>
          </HeroText>

          <HeroText delay={0.1}>
            <h1 className="hero-title">
              Book Trusted Home Experts with{' '}
              <span className="text-gradient">Instant Transparent Pricing</span>
            </h1>
          </HeroText>

          <HeroText delay={0.2}>
            <p className="hero-subtitle">
              Compare verified professionals, get a live price quote in seconds, and
              pay securely — only release payment once the job is done to your satisfaction.
            </p>
          </HeroText>

          <HeroText delay={0.3}>
            <div className="hero-search-box">
              <span className="search-icon"><SearchIcon size={16} color="var(--text-tertiary)" /></span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for cleaning, electrical, plumbing, painting…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search services"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.1rem' }}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>
          </HeroText>

          <HeroText delay={0.4}>
            <div className="hero-stats">
              {[
                { number: '100%', label: 'Background-Verified Experts' },
                { number: 'Flat', label: 'Simple Upfront Pricing' },
                { number: 'OTP', label: 'Job Completion Security' },
                { number: 'Escrow', label: 'Protected Payments' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="stat-number" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stat.number}
                  </span>
                  <span className="stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </HeroText>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="container section-padding">
        <FadeInSection>
          <div className="section-header">
            <div>
              <h2 className="section-title">Available Services Near You</h2>
              <p className="section-subtitle">Browse base rates and get a live personalised quote</p>
            </div>
            {!loading && (
              <span className="badge badge-info">{filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} listed</span>
            )}
          </div>
        </FadeInSection>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {loading ? (
          <div className="flex-center" style={{ padding: '5rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><WrenchIcon size={40} color="var(--text-tertiary)" /></div>
            <h3>{searchQuery ? 'No services match your search' : 'No services available yet'}</h3>
            <p>{searchQuery ? 'Try different keywords or browse all services.' : 'Check back soon — new providers are joining every day.'}</p>
            {searchQuery && (
              <button className="btn btn-outline" onClick={() => setSearchQuery('')} style={{ marginTop: '1.25rem' }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <StaggerContainer className="grid grid-3">
            {filteredServices.map((service) => (
              <StaggerItem key={service.id}>
                <div className="service-card" style={{ height: '100%' }}>
                  <div className="service-card-header">
                    <div className="vendor-tag">
                      <span><ServiceIcon name={service.name} size={20} /></span>
                      <span className="vendor-name">{service.vendorBusinessName || 'Certified Professional'}</span>
                    </div>
                    <span className="service-rating"><StarIcon size={13} color="var(--warning-400)" style={{ verticalAlign: '-2px' }} /> 4.9</span>
                  </div>

                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">
                    {service.description || 'Professional on-demand service delivered by a verified expert in your area.'}
                  </p>

                  <div className="service-pricing-row">
                    <div>
                      <div className="price-label">Starts from</div>
                      <div className="price-value">{Number(service.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenQuote(service)}
                    >
                      {isAuthenticated && user?.role === 'CUSTOMER' ? 'Get Quote & Book' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">Four simple steps from browsing to a job well done</p>
            </div>
          </FadeInSection>

          <StaggerContainer className="grid grid-4">
            {[
              {
                step: 1,
                icon: <SearchIcon size={20} color="var(--primary-400)" />,
                title: 'Browse & Search',
                desc: 'Explore services from verified professionals operating in your neighbourhood.',
              },
              {
                step: 2,
                icon: <TagIcon size={20} color="var(--primary-400)" />,
                title: 'Get Instant Quote',
                desc: 'Choose your preferred date and urgency level to receive a transparent, locked price.',
              },
              {
                step: 3,
                icon: <CreditCardIcon size={20} color="var(--primary-400)" />,
                title: 'Pay Securely',
                desc: 'Your payment is held in escrow — the professional is paid only after the job is complete.',
              },
              {
                step: 4,
                icon: <CheckCircleIcon size={20} color="var(--primary-400)" />,
                title: 'Confirm Completion',
                desc: 'Share your 6-digit security code with the professional only once you are fully satisfied.',
              },
            ].map((item, i) => (
              <StaggerItem key={item.step}>
                <div className="step-card">
                  <div className="step-number">{item.step}</div>
                  <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Trust Banner ── */}
      <FadeInSection>
        <section className="container" style={{ padding: '4rem 0' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.07) 100%)',
            borderColor: 'rgba(99,102,241,0.2)',
            textAlign: 'center',
            padding: '3rem 2rem',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>
              Your Money is <span className="text-gradient">Safe Until the Job is Done</span>
            </h2>
            <p style={{ maxWidth: 580, margin: '0 auto 2rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              We hold your payment in a secure escrow account throughout the booking. The professional receives
              their fee only after you personally confirm job completion using a private one-time code —
              giving you complete peace of mind.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free</Link>
              )}
              <a href="#services" className="btn btn-outline btn-lg" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Browse Services
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Quote & Booking Modal ── */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={selectedService ? `Book: ${selectedService.name}` : 'Get a Price Quote'}
        maxWidth="600px"
      >
        {bookingSuccess ? (
          <Alert type="success" message={bookingSuccess} />
        ) : (
          <div>
            {quoteError && <Alert type="error" message={quoteError} onClose={() => setQuoteError('')} />}

            {!quoteResult ? (
              <form onSubmit={handleGenerateQuote} className="form">
                <div className="form-group">
                  <label className="form-label">Service</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <ServiceIcon name={selectedService?.name} size={24} color="var(--primary-400)" />
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedService?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedService?.vendorBusinessName || 'Certified Professional'}</div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price</label>
                  <div className="form-static">{selectedService ? Number(selectedService.basePrice).toLocaleString('en-IN') : '0'}</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="scheduledAt">Preferred Date & Time</label>
                  <input
                    id="scheduledAt"
                    type="datetime-local"
                    className="form-input"
                    value={quoteScheduledAt}
                    onChange={(e) => setQuoteScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="urgency">Preferred Scheduling</label>
                  <select
                    id="urgency"
                    className="form-select"
                    value={quoteUrgency}
                    onChange={(e) => setQuoteUrgency(e.target.value)}
                  >
                    <option value="NORMAL">Standard Scheduling (Flat Price)</option>
                    <option value="URGENT">Priority Slot (No Surge Fee)</option>
                    <option value="EMERGENCY">Same-Day Emergency (No Surge Fee)</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsQuoteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={quoteLoading}
                  >
                    {quoteLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinRotate 0.8s linear infinite', display: 'inline-block' }} />
                        Checking…
                      </span>
                    ) : 'Continue to Price Details'}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                className="quote-breakdown-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="quote-header">
                  <span className="quote-badge">✓ Simple & Guaranteed Flat Price</span>
                  <span className="quote-id">Ref: {quoteResult.quoteId?.slice(0, 8)}…</span>
                </div>

                <div className="quote-math-box">
                  <div className="math-row">
                    <span>Base Service Price</span>
                    <strong>₹{Number(quoteResult.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="math-row">
                    <span>Dynamic Surge</span>
                    <strong style={{ color: 'var(--success-500)' }}>₹0.00 (Zero Surge)</strong>
                  </div>
                  <div className="math-row">
                    <span>Urgency Surcharge</span>
                    <strong style={{ color: 'var(--success-500)' }}>₹0.00 (Flat Rate)</strong>
                  </div>
                  <div className="math-divider" />
                  <div className="math-total-row">
                    <span>Total You Pay</span>
                    <span className="final-price">₹{Number(quoteResult.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="quote-expiry-note">
                  🔒 Simple transparent flat price — no hidden fees or peak charges.
                </div>

                <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setQuoteResult(null)}
                  >
                    Change options
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Confirming…' : 'Confirm Booking'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
