import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial verification
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const res = await authApi.login(email, password, role);
    const userData = {
      id: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
    };

    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(res.token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    // If backend returns token on register or user object
    if (res.token) {
      const userData = {
        id: res.userId,
        name: res.name,
        email: res.email,
        role: res.role,
      };
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(res.token);
      setUser(userData);
      return userData;
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
