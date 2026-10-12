import { apiClient } from './client';

export const paymentsApi = {
  createOrder: (bookingId) =>
    apiClient('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  verifyPayment: (data) =>
    apiClient('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBookingPayments: (bookingId) =>
    apiClient(`/payments/booking/${bookingId}`),
};
