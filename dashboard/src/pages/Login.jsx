/**
 * Login sayfası — email + parola ile giriş.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('driver@example.com');
  const [password, setPassword] = useState('driver123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1>🚗 Safe Drive</h1>
        <p className="subtitle">Sürücü davranış analizi paneli</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Parola</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
          Hesabınız yok mu? <Link to="/register">Kayıt olun</Link>
        </p>

        <div style={{ marginTop: 20, fontSize: 12, color: '#6b7280', padding: 12, background: '#f8fafc', borderRadius: 6 }}>
          <strong>Demo hesaplar:</strong><br />
          Sürücü: driver@example.com / driver123<br />
          Admin: admin@example.com / admin123
        </div>
      </form>
    </div>
  );
}
