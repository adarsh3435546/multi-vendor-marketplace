const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, config);

    if (response.status === 401) {
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
      const data = await response.json().catch(() => null);
      if (isAuthEndpoint || !token) {
        const error = new Error(data?.message || 'Invalid email or password.');
        error.status = 401;
        error.data = data;
        throw error;
      }
      // Token was rejected on an authenticated request: clear it and send to login once.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?session_expired=true';
      }
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || (data?.errors ? Object.values(data.errors).join(', ') : `Request failed with status ${response.status}`);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to reach the server. Please ensure the backend server is running on port 8080.');
    }
    throw err;
  }
}
