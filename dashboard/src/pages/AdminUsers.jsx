/**
 * Admin sayfası — kullanıcı yönetimi.
 * Sadece admin role'üyle erişilebilir (ProtectedRoute role="admin").
 */
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Yükleme hatası');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div>
      <h1>Kullanıcılar</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Ad</th><th>Email</th><th>Rol</th><th>Kayıt Tarihi</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button className="danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => deleteUser(u._id)}>
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
