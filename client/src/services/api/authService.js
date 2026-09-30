import { request } from './apiClient.js';

export const authService = {
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = res?.token || res?.data?.token;
    const user = res?.user || res?.data?.user;

    if (token) {
      localStorage.setItem('caresync_token', token);
      if (user) {
        localStorage.setItem('caresync_user', JSON.stringify(user));
      }
    }

    return { token, user, ...(res.data || res) };
  },

  async register(userData) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const token = res?.token || res?.data?.token;
    const user = res?.user || res?.data?.user;

    if (token) {
      localStorage.setItem('caresync_token', token);
      if (user) {
        localStorage.setItem('caresync_user', JSON.stringify(user));
      }
    }

    return { token, user, ...(res.data || res) };
  },

  async getMe() {
    const res = await request('/auth/me');
    return res.user || res.data?.user || res.data || res;
  },

  logout() {
    localStorage.removeItem('caresync_token');
    localStorage.removeItem('caresync_user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('caresync_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};
