/**
 * Mobil AuthContext.
 * Token SecureStore'da, kullanıcı bilgisi memory'de tutuluyor.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        await SecureStore.deleteItemAsync('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('token', res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
