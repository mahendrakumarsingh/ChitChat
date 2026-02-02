import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
  });

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ username: data.username, name: data.name, email: data.email }));
      setAuthState({
        isAuthenticated: true,
        user: { username: data.username, name: data.name, email: data.email },
        token: data.token,
      });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  const updateProfile = useCallback(async (formData) => {
    // formData can contain 'name' and 'avatar' file
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Content-Type is multipart/form-data, let browser set it
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      // Update local storage and state
      const newUser = { ...data.user, status: 'online' };
      localStorage.setItem('user', JSON.stringify(newUser));

      setAuthState(prev => ({
        ...prev,
        user: newUser,
      }));

      return { success: true, user: newUser };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, []);

  const updateUserStatus = useCallback((status) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, status } : null,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUserStatus,
    updateProfile,
  };
};