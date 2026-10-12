import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../api/services';
import { Alert } from '../components/Alert';
import { FadeInSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';
import { SearchIcon, ZapIcon, DropletIcon, BrushIcon, PackageIcon, WrenchIcon } from '../components/Icons';
import { getServiceIconComp, ServiceIcon } from '../components/ServiceIcon';
import { CleaningIcon, AcIcon, BugIcon } from '../components/Icons';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Electrical', value: 'electric', Icon: ZapIcon },
  { label: 'Plumbing', value: 'plumb', Icon: DropletIcon },
  { label: 'Cleaning', value: 'clean', Icon: CleaningIcon },
  { label: 'Painting', value: 'paint', Icon: BrushIcon },
  { label: 'AC & Appliances', value: 'ac', Icon: AcIcon },
  { label: 'Pest Control', value: 'pest', Icon: BugIcon },
  { label: 'Carpentry', value: 'carpentr', Icon: PackageIcon },
];


export function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getActiveServices();
      setServices(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
    const matchesCat = !category || s.name.toLowerCase().includes(category);
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Header */}
      <section style={{ padding: '5rem 0 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 700px 300px at 50% 30%, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <h1 style={{ marginBottom: '1rem' }}>All <span className="text-gradient">Services</span></h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              Browse all available services from verified professionals in your area with simple, transparent flat pricing.
            </p>

            {/* Search */}
            <div className="hero-search-box" style={{ maxWidth: 560, margin: '0 auto 2rem', display: 'flex' }}>
              <SearchIcon size={18} color="var(--text-tertiary)" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search services by name or keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search services"
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              )}
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CATEGORIES.map(({ label, value, Icon }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${category === value ? 'var(--primary-500)' : 'var(--border-default)'}`,
                    background: category === value ? 'rgba(37,99,235,0.1)' : 'transparent',
                    color: category === value ? 'var(--primary-600)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.825rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {Icon && <Icon size={13} />}
                  {label}
                </button>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Services Grid */}
      <div className="container" style={{ paddingBottom: '5rem' }}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {loading ? (
          <div className="flex-center" style={{ padding: '5rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.5 }}>
              <WrenchIcon size={48} color="var(--text-tertiary)" />
            </div>
            <h3>{search || category ? 'No matching services' : 'No services available'}</h3>
            <p>{search || category ? 'Try different keywords or browse all categories.' : 'Check back soon — new providers join every day.'}</p>
            {(search || category) && (
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }} style={{ marginTop: '1.25rem' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> service{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <StaggerContainer className="grid grid-3">
              {filtered.map((service) => {
                const ServiceIconComp = getServiceIconComp(service.name);
                return (
                  <StaggerItem key={service.id}>
                    <div className="service-card" style={{ height: '100%' }}>
                      <div className="service-card-header">
                        <div className="vendor-tag">
                          <ServiceIconComp size={14} color="var(--text-secondary)" />
                          <span>{service.vendorBusinessName || 'Certified Professional'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning-400)', fontSize: '0.8rem', fontWeight: 700 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--warning-400)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          4.9
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ServiceIconComp size={20} color="var(--primary-600)" />
                        </div>
                      </div>

                      <h3 className="service-name">{service.name}</h3>
                      <p className="service-desc">
                        {service.description || 'Professional on-demand service from a background-verified expert in your area.'}
                      </p>

                      <div className="service-pricing-row">
                        <div>
                          <div className="price-label">Simple Flat Price</div>
                          <div className="price-value">₹{Number(service.basePrice).toLocaleString('en-IN')}</div>
                        </div>
                        <Link to="/register" className="btn btn-primary">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </>
        )}
      </div>
    </div>
  );
}
