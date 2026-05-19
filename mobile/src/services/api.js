/**
 * ============================================================
 * Mobil API İstemcisi (Axios)
 * ============================================================
 *
 * NOT: Mobil emülatöründen "localhost" backend'e ulaşmaz.
 *   - Android emülator: 10.0.2.2 (varsayılan)
 *   - iOS simülatör: localhost çalışır
 *   - Fiziksel cihaz: bilgisayarın LAN IP'si (ör. 192.168.1.10)
 *
 * Bu URL'i app.json içindeki extra.apiUrl üzerinden geliyor.
 * Geliştirici LAN IP'sini değiştirmek için app.json'a dokunuyor, kod değişmiyor.
 * ============================================================
 */

import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const baseURL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 10000
});

// Her isteğe token ekle
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { baseURL };
