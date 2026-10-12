import { apiClient } from './client';

export const authApi = {
  login: (email, password, role) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: role || null }),
    }),

  register: (data) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
