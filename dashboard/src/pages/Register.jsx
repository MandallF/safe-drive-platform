import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1>Kayıt Ol</h1>
        <p className="subtitle">Yeni sürücü hesabı oluşturun</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Ad Soyad</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required minLength={2} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Parola (en az 6 karakter)</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>

        <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
          Hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </p>
      </form>
    </div>
  );
}
