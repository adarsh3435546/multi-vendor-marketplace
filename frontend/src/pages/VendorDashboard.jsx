import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { servicesApi } from '../api/services';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { ServiceIcon } from '../components/ServiceIcon';
import { InboxIcon, WrenchIcon, KeyIcon } from '../components/Icons';
import { FadeInSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';


function StatusPill({ status }) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [myServices, setMyServices] = useState([]);
  const [vendorBookings, setVendorBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', basePrice: '' });
  const [serviceSaving, setServiceSaving] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState(null);
  const [completionOtpInput, setCompletionOtpInput] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => { loadVendorData(); }, []);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [servicesData, bookingsData] = await Promise.all([
        servicesApi.getMyServices(),
        bookingsApi.getVendorBookings(),
      ]);
      setMyServices((servicesData || []).filter((s) => s.active !== false));
      setVendorBookings(bookingsData || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load your workspace data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceForm({ name: '', description: '', basePrice: '' });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setServiceForm({ name: service.name, description: service.description || '', basePrice: service.basePrice });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      setServiceSaving(true);
      setAlert(null);
      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        basePrice: parseFloat(serviceForm.basePrice),
      };
      if (editingService) {
        await servicesApi.updateService(editingService.id, payload);
        setAlert({ type: 'success', message: `"${serviceForm.name}" has been updated.` });
      } else {
        await servicesApi.createService(payload);
        setAlert({ type: 'success', message: `"${serviceForm.name}" is now live on the marketplace.` });
      }
      setIsServiceModalOpen(false);
      await loadVendorData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not save service. Please try again.' });
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeactivateService = async (service) => {
    if (!window.confirm(`Remove "${service.name}" from the marketplace? Customers will no longer be able to book it.`)) return;
    try {
      await servicesApi.deactivateService(service.id);
      setAlert({ type: 'info', message: `"${service.name}" has been removed from the marketplace.` });
      setMyServices((prev) => prev.filter((s) => s.id !== service.id));
      await loadVendorData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not deactivate service.' });
    }
  };

  const handleConfirmBooking = async (booking) => {
    try {
      await bookingsApi.confirmBooking(booking.id);
      setAlert({ type: 'success', message: `Booking #${booking.id} confirmed. The customer has received their completion code.` });
      await loadVendorData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not confirm booking.' });
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsApi.cancelBooking(booking.id);
      setAlert({ type: 'info', message: `Booking #${booking.id} has been cancelled.` });
      await loadVendorData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not cancel booking.' });
    }
  };

  const handleOpenCompleteOtpModal = (booking) => {
    setSelectedBookingForOtp(booking);
    setCompletionOtpInput('');
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtpAndComplete = async (e) => {
    e.preventDefault();
    if (!selectedBookingForOtp || !completionOtpInput) return;
    try {
      setOtpVerifying(true);
      await bookingsApi.completeBooking(selectedBookingForOtp.id, completionOtpInput.trim());
      setAlert({ type: 'success', message: `Job for booking #${selectedBookingForOtp.id} marked complete. Payment will be released to you.` });
      setIsOtpModalOpen(false);
      await loadVendorData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Incorrect code. Please ask the customer for their 6-digit completion code.' });
    } finally {
      setOtpVerifying(false);
    }
  };

  // Metrics
  const completedCount = vendorBookings.filter(b => b.status === 'COMPLETED').length;
  const pendingCount = vendorBookings.filter(b => b.status === 'PENDING').length;
  const totalEarned = vendorBookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.finalPrice || 0), 0);

  return (
    <div className="container dashboard-container">
      {/* Header */}
      <FadeInSection>
        <div className="dashboard-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 className="dashboard-title">My Workspace</h1>
              <span className="badge badge-success">Active</span>
            </div>
            <p className="dashboard-subtitle">
              {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Manage your services and bookings'}
            </p>
          </div>

          <div className="tab-pills">
            <button className={`tab-pill ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <InboxIcon size={15} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />Bookings
              {pendingCount > 0 && (
                <span style={{ marginLeft: '0.375rem', background: 'var(--warning-400)', color: '#000', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, padding: '1px 7px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button className={`tab-pill ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <WrenchIcon size={15} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />My Services
            </button>
          </div>
        </div>
      </FadeInSection>

      {/* Metric summary strip */}
      <FadeInSection delay={0.05}>
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Bookings', value: vendorBookings.length, sub: 'All time' },
            { label: 'Awaiting Confirmation', value: pendingCount, sub: 'Action required', highlight: pendingCount > 0 },
            { label: 'Jobs Completed', value: completedCount, sub: 'Successfully delivered' },
            { label: 'Estimated Earnings', value: `${totalEarned.toLocaleString('en-IN')}`, sub: 'From completed jobs', accent: true },
          ].map((m) => (
            <div key={m.label} className={`metric-card ${m.accent ? 'highlight-card' : ''}`}>
              <span className="metric-label">{m.label}</span>
              <div className="metric-value" style={m.highlight && m.value > 0 ? { color: 'var(--warning-400)' } : {}}>{m.value}</div>
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
        <FadeInSection>
          {vendorBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><InboxIcon size={40} color="var(--text-tertiary)" /></div>
              <h3>No bookings yet</h3>
              <p>Once customers book your services they will appear here. Make sure your services are listed and active.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('services')} style={{ marginTop: '1.25rem' }}>
                Manage Services
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Scheduled</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorBookings.map((b) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{b.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.customerEmail}</div>
                      </td>
                      <td><strong>{b.serviceName}</strong></td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--success-400)', fontFamily: 'var(--font-mono)' }}>
                          {Number(b.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td><StatusPill status={b.status} /></td>
                      <td>
                        <div className="table-actions">
                          {b.status === 'PENDING' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleConfirmBooking(b)}>
                              Accept
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenCompleteOtpModal(b)}>
                              <KeyIcon size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Complete
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(b)}>
                              Cancel
                            </button>
                          )}
                          {b.status === 'COMPLETED' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success-400)' }}>Done</span>
                          )}
                          {b.status === 'CANCELLED' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Cancelled</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FadeInSection>
      ) : (
        <FadeInSection>
          <div className="section-header">
            <div>
              <h2 className="section-title">My Services</h2>
              <p className="section-subtitle">Services listed here are visible to customers on the marketplace</p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateService}>
              + Add Service
            </button>
          </div>

          {myServices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><WrenchIcon size={40} color="var(--text-tertiary)" /></div>
              <h3>No services listed yet</h3>
              <p>Add your first service to start accepting bookings from customers in your area.</p>
              <button className="btn btn-primary" onClick={handleOpenCreateService} style={{ marginTop: '1.25rem' }}>
                Add Your First Service
              </button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-3">
              {myServices.map((service) => (
                <StaggerItem key={service.id}>
                  <div className="service-card" style={{ height: '100%' }}>
                    <div className="service-card-header">
                      <span className="badge" style={{ fontSize: '1.5rem', background: 'none', padding: 0 }}>
                        <ServiceIcon name={service.name} size={20} />
                      </span>
                      <span className="badge badge-success">
                        Live
                      </span>
                    </div>

                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-desc">{service.description || 'No description added yet.'}</p>

                    <div className="service-pricing-row">
                      <div>
                        <div className="price-label">Base Price</div>
                        <div className="price-value">{Number(service.basePrice).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditService(service)}>Edit</button>
                      {service.active && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeactivateService(service)}>Remove</button>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeInSection>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={editingService ? `Edit: ${editingService.name}` : 'Add New Service'}
      >
        <form onSubmit={handleSaveService} className="form">
          <div className="form-group">
            <label className="form-label" htmlFor="serviceName">Service name</label>
            <input
              id="serviceName"
              type="text"
              className="form-input"
              placeholder="e.g. Deep Kitchen Cleaning"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="serviceDesc">Description <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              id="serviceDesc"
              className="form-input"
              rows="3"
              placeholder="What does this service include? What should the customer expect?"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="servicePrice">Starting price ()</label>
            <input
              id="servicePrice"
              type="number"
              step="0.01"
              min="1"
              className="form-input"
              placeholder="499"
              value={serviceForm.basePrice}
              onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              The final price shown to customers may vary based on demand and urgency.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={serviceSaving}>
              {serviceSaving ? 'Saving…' : editingService ? 'Save Changes' : 'List Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete with OTP Modal */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Mark Job as Complete"
        maxWidth="440px"
      >
        <form onSubmit={handleVerifyOtpAndComplete} className="form">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <KeyIcon size={44} color="var(--primary-400)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ask your customer for the <strong style={{ color: 'var(--text-primary)' }}>6-digit code</strong> from their booking confirmation.
              Enter it below to confirm the job is complete and release payment.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="completionOtp" style={{ textAlign: 'center', display: 'block' }}>
              Customer Completion Code
            </label>
            <input
              id="completionOtp"
              type="text"
              className="form-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="• • • • • •"
              value={completionOtpInput}
              onChange={(e) => setCompletionOtpInput(e.target.value.replace(/\D/g, ''))}
              style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              required
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsOtpModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={otpVerifying || completionOtpInput.length < 6}>
              {otpVerifying ? 'Verifying…' : 'Confirm & Complete Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
