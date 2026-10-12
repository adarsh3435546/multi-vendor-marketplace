import { apiClient } from './client';

export const bookingsApi = {
  createBooking: (quoteId) =>
    apiClient('/bookings', {
      method: 'POST',
      body: JSON.stringify({ quoteId }),
    }),

  getMyBookings: () => apiClient('/bookings/my'),

  getBookingById: (id) => apiClient(`/bookings/${id}`),

  getBookingOtp: (id) => apiClient(`/bookings/${id}/otp`),

  getVendorBookings: () => apiClient('/vendor/bookings'),

  confirmBooking: (id) =>
    apiClient(`/bookings/${id}/confirm`, {
      method: 'PATCH',
    }),

  cancelBooking: (id) =>
    apiClient(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    }),

  completeBooking: (id, otp) =>
    apiClient(`/bookings/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),
};
