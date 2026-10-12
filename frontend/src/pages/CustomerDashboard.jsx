import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { servicesApi } from '../api/services';
import { pricingApi } from '../api/pricing';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';
import { initiateRazorpayPayment } from '../utils/razorpay';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { ServiceIcon } from '../components/ServiceIcon';
import { SearchIcon, CalendarIcon, KeyIcon, ClipboardListIcon, WrenchIcon, ShieldCheckIcon } from '../components/Icons';
import { FadeInSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';


function StatusPill({ status }) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteScheduledAt, setQuoteScheduledAt] = useState('');
  const [quoteUrgency, setQuoteUrgency] = useState('NORMAL');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [activeOtp, setActiveOtp] = useState(null);

  const [paymentLoading, setPaymentLoading] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, bookingsData] = await Promise.all([
        servicesApi.getActiveServices(),
        bookingsApi.getMyBookings(),
      ]);
      setServices(servicesData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load your dashboard. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuote = (service) => {
    setSelectedService(service);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    setQuoteScheduledAt(tomorrow.toISOString().slice(0, 16));
    setQuoteUrgency('NORMAL');
    setQuoteResult(null);
    setIsQuoteModalOpen(true);
  };

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    try {
      setQuoteLoading(true);
      setAlert(null);
      const formattedDate = new Date(quoteScheduledAt).toISOString();
      const quote = await pricingApi.getQuote(selectedService.id, formattedDate, quoteUrgency);
      setQuoteResult(quote);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not calculate a price quote.' });
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!quoteResult) return;
    try {
      setBookingLoading(true);
      await bookingsApi.createBooking(quoteResult.quoteId);
      setAlert({ type: 'success', message: 'Booking confirmed! Head to "My Bookings" to track and pay.' });
      setIsQuoteModalOpen(false);
      setActiveTab('bookings');
      await loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not confirm booking.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsApi.cancelBooking(booking.id);
      setAlert({ type: 'info', message: `Booking #${booking.id} has been cancelled.` });
      await loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not cancel booking.' });
    }
  };

  const handleViewOtp = async (booking) => {
    try {
      if (booking.completionOtp) {
        setActiveOtp({ bookingId: booking.id, otp: booking.completionOtp });
        setIsOtpModalOpen(true);
        return;
      }
      const data = await bookingsApi.getBookingOtp(booking.id);
      setActiveOtp(data);
      setIsOtpModalOpen(true);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not retrieve your completion code.' });
    }
  };

  const handlePayWithRazorpay = async (booking) => {
    try {
      setPaymentLoading(booking.id);
      setAlert(null);
      const orderData = await paymentsApi.createOrder(booking.id);
      await initiateRazorpayPayment({
        orderData,
        onSuccess: async (paymentDetails) => {
          try {
            const verificationResult = await paymentsApi.verifyPayment(paymentDetails);
            setAlert({
              type: 'success',
              message: `Payment of ${Number(booking.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })} confirmed! (Ref: ${verificationResult.razorpayPaymentId})`,
            });
            await loadData();
          } catch (verifErr) {
            setAlert({ type: 'error', message: verifErr.message || 'Payment was received but verification failed. Please contact support.' });
          }
        },
        onError: (paymentErr) => {
          if (!paymentErr.message.includes('dismissed')) {
            setAlert({ type: 'error', message: paymentErr.message || 'Payment could not be processed.' });
          }
        },
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Unable to initiate payment checkout.' });
    } finally {
      setPaymentLoading(null);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  // Metrics
  const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="container dashboard-container">
      {/* Header */}
      <FadeInSection>
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'My Dashboard'}
            </h1>
            <p className="dashboard-subtitle">Track your bookings, view completion codes, and book new services</p>
          </div>

          <div className="tab-pills">
            <button className={`tab-pill ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <ClipboardListIcon size={15} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />My Bookings
              {activeBookings > 0 && (
                <span style={{ marginLeft: '0.375rem', background: 'var(--primary-500)', color: '#fff', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, padding: '1px 7px' }}>
                  {activeBookings}
                </span>
              )}
            </button>
            <button className={`tab-pill ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <SearchIcon size={15} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />Book a Service
            </button>
          </div>
        </div>
      </FadeInSection>

      {/* Quick metrics */}
      <FadeInSection delay={0.05}>
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Bookings', value: bookings.length, sub: 'All time' },
            { label: 'Active', value: activeBookings, sub: 'Awaiting service' },
            { label: 'Completed', value: completedBookings, sub: 'Successfully delivered' },
            { label: 'Available Services', value: services.length, sub: 'From verified providers', accent: true },
          ].map((m) => (
            <div key={m.label} className={`metric-card ${m.accent ? 'highlight-card' : ''}`}>
              <span className="metric-label">{m.label}</span>
              <div className="metric-value">{m.value}</div>
              <span className="metric-sub">{m.sub}</span>
            </div>
          ))}
        </div>
      </FadeInSection>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="flex-center" style={{ padding: '5rem 0' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'bookings' ? (
        /* ── My Bookings ── */
        <FadeInSection>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CalendarIcon size={40} color="var(--text-tertiary)" /></div>
              <h3>No bookings yet</h3>
              <p>Browse available services and get an instant price quote to make your first booking.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('services')} style={{ marginTop: '1.25rem' }}>
                Browse Services
              </button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-2">
              {bookings.map((booking) => (
                <StaggerItem key={booking.id}>
                  <div className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <span className="booking-id">Booking #{booking.id}</span>
                        <h3 className="booking-service-name">{booking.serviceName}</h3>
                        <div className="booking-vendor">by {booking.vendorBusinessName}</div>
                      </div>
                      <StatusPill status={booking.status} />
                    </div>

                    <div className="booking-details-grid">
                      <div>
                        <span className="detail-label">Scheduled</span>
                        <strong style={{ fontSize: '0.875rem' }}>
                          {new Date(booking.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </strong>
                      </div>
                      <div>
                        <span className="detail-label">Amount</span>
                        <strong className="text-highlight" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>
                          {Number(booking.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-actions-row">
                      {booking.status === 'CONFIRMED' && (
                        <button className="btn btn-info btn-sm" onClick={() => handleViewOtp(booking)}>
                          <KeyIcon size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />View Completion Code
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handlePayWithRazorpay(booking)}
                          disabled={paymentLoading === booking.id}
                        >
                          {paymentLoading === booking.id ? 'Processing…' : 'Pay Now'}
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(booking)}>
                          Cancel
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success-400)' }}>Completed & paid</span>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeInSection>
      ) : (
        /* ── Browse Services ── */
        <FadeInSection>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="hero-search-box" style={{ maxWidth: 420, margin: 0, padding: '0.5rem 1.25rem' }}>
              <span className="search-icon"><SearchIcon size={16} color="var(--text-tertiary)" /></span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Filter services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.1rem' }}
                >×</button>
              )}
            </div>
            <span className="badge badge-info">{filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><WrenchIcon size={40} color="var(--text-tertiary)" /></div>
              <h3>No services found</h3>
              <p>Try different keywords or check back soon — new providers join every day.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-3">
              {filteredServices.map((service) => (
                <StaggerItem key={service.id}>
                  <div className="service-card" style={{ height: '100%' }}>
                    <div className="service-card-header">
                      <div className="vendor-tag">
                        <span><ServiceIcon name={service.name} size={20} /></span>
                        <span>{service.vendorBusinessName || 'Certified Professional'}</span>
                      </div>
                    </div>
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-desc">{service.description || 'Professional service from a verified provider.'}</p>
                    <div className="service-pricing-row">
                      <div>
                        <div className="price-label">Starts from</div>
                        <div className="price-value">{Number(service.basePrice).toLocaleString('en-IN')}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => handleOpenQuote(service)}>
                        Get Quote
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeInSection>
      )}

      {/* Quote Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={selectedService ? `Book: ${selectedService.name}` : 'Get a Price Quote'}
      >
        {!quoteResult ? (
          <form onSubmit={handleGenerateQuote} className="form">
            <div className="form-group">
              <label className="form-label">Preferred date & time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={quoteScheduledAt}
                onChange={(e) => setQuoteScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="custUrgency">How soon do you need this?</label>
              <select id="custUrgency" className="form-select" value={quoteUrgency} onChange={(e) => setQuoteUrgency(e.target.value)}>
                <option value="NORMAL">Flexible — Standard scheduling</option>
                <option value="URGENT">Soon — Expedited service (×1.25)</option>
                <option value="EMERGENCY">Right Now — Same-day emergency (×1.50)</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsQuoteModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={quoteLoading}>
                {quoteLoading ? 'Calculating…' : 'Get My Quote'}
              </button>
            </div>
          </form>
        ) : (
          <motion.div className="quote-breakdown-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="quote-header">
              <span className="quote-badge">⏱ Price locked for 15 minutes</span>
              <span className="quote-id">Ref: {quoteResult.quoteId?.slice(0, 8)}…</span>
            </div>

            <div className="quote-math-box">
              <div className="math-row">
                <span>Base price</span>
                <strong>{Number(quoteResult.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="math-row">
                <span>Demand adjustment</span>
                <strong className="text-highlight">× {Number(quoteResult.demandMultiplier).toFixed(2)}</strong>
              </div>
              <div className="math-row">
                <span>Urgency ({quoteResult.urgency === 'NORMAL' ? 'Flexible' : quoteResult.urgency === 'URGENT' ? 'Soon' : 'Right Now'})</span>
                <strong className="text-highlight">× {Number(quoteResult.urgencyMultiplier).toFixed(2)}</strong>
              </div>
              <div className="math-divider" />
              <div className="math-total-row">
                <span>Total</span>
                <span className="final-price">{Number(quoteResult.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="quote-expiry-note">
              ⏰ Expires at {new Date(quoteResult.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setQuoteResult(null)}>Change options</button>
              <button type="button" className="btn btn-success" onClick={handleConfirmBooking} disabled={bookingLoading}>
                {bookingLoading ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </div>
          </motion.div>
        )}
      </Modal>

      {/* OTP Display Modal */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Your Completion Code"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <ShieldCheckIcon size={44} color="var(--primary-400)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 1.75rem' }}>
            Share this code with your service provider <strong style={{ color: 'var(--text-primary)' }}>only after</strong> the job has been completed to your satisfaction. This releases their payment.
          </p>

          <div className="otp-display-box">
            <span className="otp-digits">{activeOtp?.otp || '------'}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '1.5rem' }}>
            Do not share this code in advance. Your payment is protected until you confirm completion.
          </p>

          <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => setIsOtpModalOpen(false)}>Got it</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
