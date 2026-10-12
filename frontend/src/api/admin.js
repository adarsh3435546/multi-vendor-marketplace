import { apiClient } from './client';

export const adminApi = {
  getUsers: () => apiClient('/admin/users'),

  getVendors: () => apiClient('/admin/vendors'),

  getBookings: () => apiClient('/admin/bookings'),

  getPayments: () => apiClient('/admin/payments'),

  updateVendorAvailability: (id, available) =>
    apiClient(`/admin/vendors/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    }),
};
