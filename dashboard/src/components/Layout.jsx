/**
 * Layout — Sol sidebar + üst topbar + içerik.
 * Korunmuş tüm sayfalar bunun içinde gösterilir.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AlarmToastContainer from './AlarmToast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>🚗 Safe Drive</h2>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/trips">Sürüşler</NavLink>
          <NavLink to="/alarms">Alarmlar</NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/users">Kullanıcılar</NavLink>
              <NavLink to="/admin/devices">Cihazlar</NavLink>
            </>
          )}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="topbar" style={{ padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', margin: 0 }}>
          <div>
            <strong>{user?.name}</strong>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#6b7280' }}>({user?.role})</span>
          </div>
          <button onClick={handleLogout} className="secondary">Çıkış Yap</button>
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <AlarmToastContainer />
    </div>
  );
}
