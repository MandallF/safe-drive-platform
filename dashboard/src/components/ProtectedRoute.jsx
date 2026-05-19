/**
 * Korunmuş rota wrapper'ı.
 * Login değilse /login'e yönlendir, admin gerekiyorsa kontrol et.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Yükleniyor...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <div style={{ padding: 40 }}>Bu sayfa için yetkiniz yok.</div>;
  }
  return children;
}
