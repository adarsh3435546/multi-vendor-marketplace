import { apiClient } from './client';

export const servicesApi = {
  getActiveServices: () => apiClient('/services'),

  getServiceById: (id) => apiClient(`/services/${id}`),

  getMyServices: () => apiClient('/services/mine'),

  createService: (data) =>
    apiClient('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id, data) =>
    apiClient(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deactivateService: (id) =>
    apiClient(`/services/${id}/deactivate`, {
      method: 'PATCH',
    }),
};
