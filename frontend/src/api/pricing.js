import { apiClient } from './client';

export const pricingApi = {
  getQuote: (serviceId, scheduledAt, urgency) =>
    apiClient('/pricing/quote', {
      method: 'POST',
      body: JSON.stringify({ serviceId, scheduledAt, urgency }),
    }),
};
