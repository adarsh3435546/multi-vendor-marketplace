import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../api/admin';
import { Alert } from '../components/Alert';
import { FadeInSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';
import {
  UsersIcon, StoreIcon, BarChart2Icon, CreditCardIcon, IndianRupeeIcon,
  TrendingUpIcon, CheckCircleIcon, ToggleLeftIcon, ToggleRightIcon,
  RefreshIcon, SettingsIcon,
} from '../components/Icons';

function StatusPill({ status }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [togglingVendor, setTogglingVendor] = useState(null);

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, vendorsData, bookingsData, paymentsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getVendors(),
        adminApi.getBookings(),
        adminApi.getPayments(),
      ]);
      setUsers(usersData || []);
      setVendors(vendorsData || []);
      setBookings(bookingsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load platform data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVendorAvailability = async (vendor) => {
    try {
      setTogglingVendor(vendor.id);
      const updated = await adminApi.updateVendorAvailability(vendor.id, !vendor.available);
      setVendors((prev) => prev.map((v) => (v.id === updated.id ? { ...v, available: updated.available } : v)));
      setAlert({
        type: 'success',
        message: `${vendor.businessName} is now marked as ${updated.available ? 'available' : 'unavailable'}.`,
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not update provider status.' });
    } finally {
      setTogglingVendor(null);
    }
  };

  const totalVolume = payments.filter(p => p.status === 'CAPTURED').reduce((a, p) => a + Number(p.amount || 0), 0);
  const platformRevenue = payments.filter(p => p.status === 'CAPTURED').reduce((a, p) => a + Number(p.commission || 0), 0);
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const activeVendors = vendors.filter(v => v.available).length;

  const tabs = [
    { id: 'overview', label: 'Overview', Icon: BarChart2Icon },
    { id: 'users', label: `Users (${users.length})`, Icon: UsersIcon },
    { id: 'vendors', label: `Providers (${vendors.length})`, Icon: StoreIcon },
    { id: 'bookings', label: `Bookings (${bookings.length})`, Icon: CheckCircleIcon },
    { id: 'payments', label: `Payments (${payments.length})`, Icon: CreditCardIcon },
  ];

  return (
    <div className="container dashboard-container">
      {/* Header */}
      <FadeInSection>
        <div className="dashboard-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 className="dashboard-title">Platform Admin</h1>
              <span className="badge badge-admin">Master Console</span>
            </div>
            <p className="dashboard-subtitle">Platform overview, user management, provider control, and payment audit</p>
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadAdminData} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <RefreshIcon size={14} />
            Refresh
          </button>
        </div>
      </FadeInSection>

      {/* Tab navigation */}
      <FadeInSection delay={0.05}>
        <div className="tab-pills" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} className={`tab-pill ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Icon size={14} />
                {label}
              </span>
            </button>
          ))}
        </div>
      </FadeInSection>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="flex-center" style={{ padding: '5rem 0' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'overview' ? (
        <FadeInSection>
          {/* KPI Cards */}
          <StaggerContainer className="grid grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: users.length, sub: `${users.filter(u => u.role === 'CUSTOMER').length} customers · ${users.filter(u => u.role === 'VENDOR').length} providers`, Icon: UsersIcon, color: 'var(--info-400)' },
              { label: 'Active Providers', value: activeVendors, sub: `of ${vendors.length} registered`, Icon: StoreIcon, color: 'var(--success-400)' },
              { label: 'Jobs Completed', value: completedBookings, sub: `of ${bookings.length} total bookings`, Icon: CheckCircleIcon, color: 'var(--primary-400)' },
              { label: 'Platform Revenue', value: `${platformRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: `Gross volume ${totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, Icon: IndianRupeeIcon, accent: true, color: '#c084fc' },
            ].map((m) => (
              <StaggerItem key={m.label}>
                <div className={`metric-card ${m.accent ? 'highlight-card' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="metric-label">{m.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <m.Icon size={18} color={m.color} />
                    </div>
                  </div>
                  <div className="metric-value">{m.value}</div>
                  <span className="metric-sub">{m.sub}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Revenue card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <TrendingUpIcon size={20} color="var(--primary-400)" />
              <h3 style={{ fontWeight: 700 }}>Platform Overview</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The platform operates on a commission-based model where a percentage is retained from each completed job payment.
              Providers receive their earnings once a customer confirms job completion using their secure one-time code.
              All financial transactions are processed through an escrow mechanism that protects both customers and service providers.
            </p>
          </div>
        </FadeInSection>

      ) : activeTab === 'users' ? (
        <FadeInSection>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{u.id}</span></td>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                    <td><span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role === 'CUSTOMER' ? 'Customer' : u.role === 'VENDOR' ? 'Provider' : 'Admin'}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>

      ) : activeTab === 'vendors' ? (
        <FadeInSection>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business Name</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{v.id}</span></td>
                    <td><strong>{v.businessName}</strong></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning-400)', fontWeight: 700 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--warning-400)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        {Number(v.rating).toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${v.available ? 'status-completed' : 'status-cancelled'}`}>
                        {v.available ? 'Available' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${v.available ? 'btn-outline-danger' : 'btn-success'}`}
                        onClick={() => handleToggleVendorAvailability(v)}
                        disabled={togglingVendor === v.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        {togglingVendor === v.id
                          ? <><RefreshIcon size={13} />Updating…</>
                          : v.available
                          ? <><ToggleRightIcon size={14} />Mark Offline</>
                          : <><ToggleLeftIcon size={14} />Mark Available</>
                        }
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>

      ) : activeTab === 'bookings' ? (
        <FadeInSection>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Scheduled</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{b.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{b.customerEmail}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.vendorBusinessName}</td>
                    <td><strong>{b.serviceName}</strong></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--success-400)' }}>{Number(b.finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                    <td><StatusPill status={b.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>

      ) : (
        /* Payments */
        <FadeInSection>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx</th>
                  <th>Booking</th>
                  <th>Order Ref</th>
                  <th>Payment Ref</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Provider Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)' }}>
                      No payment records yet.
                    </td>
                  </tr>
                ) : payments.map((p) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{p.id}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{p.bookingId}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.razorpayOrderId || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.razorpayPaymentId || '—'}</td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                    <td style={{ color: 'var(--primary-400)', fontFamily: 'var(--font-mono)' }}>{Number(p.commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: 'var(--success-400)', fontFamily: 'var(--font-mono)' }}>{Number(p.vendorAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`status-pill ${p.status === 'CAPTURED' ? 'status-completed' : p.status === 'FAILED' ? 'status-cancelled' : 'status-pending'}`}>
                        {p.status === 'CAPTURED' ? 'Captured' : p.status === 'FAILED' ? 'Failed' : 'Pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>
      )}
    </div>
  );
}
