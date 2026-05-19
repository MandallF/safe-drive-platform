/**
 * Alarmlar sayfası — tüm alarmları filtrelemeli liste.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SEVERITY_LABEL = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const TYPE_LABEL = {
  hard_brake: 'Ani Fren',
  rapid_acceleration: 'Ani Hızlanma',
  sharp_turn: 'Sert Dönüş',
  shake: 'Sarsıntı',
  speeding: 'Beklenmeyen Hızlanma',
  off_route: 'Güzergâh Dışı'
};

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlarms();
  }, [severity]);

  async function fetchAlarms() {
    setLoading(true);
    const params = severity ? `?severity=${severity}` : '';
    const res = await api.get(`/alarms${params}`);
    setAlarms(res.data.alarms);
    setLoading(false);
  }

  async function markRead(id) {
    await api.patch(`/alarms/${id}/read`);
    setAlarms((prev) => prev.map((a) => a._id === id ? { ...a, isRead: true } : a));
  }

  return (
    <div>
      <h1>Alarmlar</h1>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>Şiddet:</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: 200 }}>
            <option value="">Hepsi</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <p style={{ padding: 20 }}>Yükleniyor...</p> : (
          <table>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Tür</th>
                <th>Şiddet</th>
                <th>Açıklama</th>
                <th>Sürüş</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alarms.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>Alarm yok 🎉</td></tr>
              )}
              {alarms.map((a) => (
                <tr key={a._id} style={{ opacity: a.isRead ? 0.6 : 1 }}>
                  <td>{new Date(a.timestamp).toLocaleString('tr-TR')}</td>
                  <td>{TYPE_LABEL[a.type] || a.type}</td>
                  <td><span className={`badge ${a.severity}`}>{SEVERITY_LABEL[a.severity]}</span></td>
                  <td>{a.details}</td>
                  <td><Link to={`/trips/${a.tripId}`}>Görüntüle</Link></td>
                  <td>{a.isRead ? 'Okundu' : <strong>Yeni</strong>}</td>
                  <td>
                    {!a.isRead && (
                      <button className="secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => markRead(a._id)}>
                        Okundu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
