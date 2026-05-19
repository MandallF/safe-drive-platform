/**
 * Trips sayfası — sürüş listesi.
 * Her satıra tıklayarak detay sayfasına gidilir.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips?limit=50')
      .then((res) => setTrips(res.data.trips))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d) {
    return new Date(d).toLocaleString('tr-TR');
  }

  function formatDuration(start, end) {
    if (!end) return 'Devam ediyor';
    const ms = new Date(end) - new Date(start);
    const min = Math.round(ms / 60000);
    return `${min} dk`;
  }

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Sürüş Geçmişi</h1>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Başlangıç</th>
              <th>Süre</th>
              <th>Mesafe</th>
              <th>Ort. Hız</th>
              <th>Alarm</th>
              <th>Risk Skoru</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>Henüz sürüş yok.</td></tr>
            )}
            {trips.map((t) => (
              <tr key={t._id}>
                <td>{formatDate(t.startedAt)}</td>
                <td>{formatDuration(t.startedAt, t.endedAt)}</td>
                <td>{(t.distanceMeters / 1000).toFixed(2)} km</td>
                <td>{t.avgSpeedKmh} km/h</td>
                <td>{t.alarmCount}</td>
                <td>
                  <span style={{
                    color: t.riskScore > 60 ? '#dc2626' : t.riskScore > 30 ? '#f59e0b' : '#10b981',
                    fontWeight: 600
                  }}>
                    {t.riskScore}/100
                  </span>
                </td>
                <td>
                  {t.endedAt
                    ? <span className="badge ended">Tamamlandı</span>
                    : <span className="badge active">Devam ediyor</span>}
                </td>
                <td>
                  <Link to={`/trips/${t._id}`}>Detay →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
