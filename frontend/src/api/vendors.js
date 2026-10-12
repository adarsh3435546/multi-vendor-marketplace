import { apiClient } from './client';

export const vendorsApi = {
  getAvailableVendors: (page = 0, size = 10) =>
    apiClient(`/vendors?page=${page}&size=${size}`),

  getVendorById: (id) =>
    apiClient(`/vendors/${id}`),

  getVendorServices: (id) =>
    apiClient(`/vendors/${id}/services`),
};
