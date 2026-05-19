/**
 * ============================================================
 * API İstemcisi (Axios)
 * ============================================================
 *
 * Tüm HTTP istekleri buradan geçer. Avantajları:
 *   1) Token'ı tek yerde Authorization header'a ekliyoruz
 *   2) 401 dönerse otomatik logout (response interceptor)
 *   3) Base URL'i değiştirmek tek satır
 * ============================================================
 */

import axios from 'axios';

// Vite proxy sayesinde /api isteklerini backend'e yönlendiriyoruz.
// Production'da direkt backend URL'i kullanılır.
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// Request interceptor — token'ı header'a ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401 gelirse oturumu sil
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Hard reload — tüm state'i temizler
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
