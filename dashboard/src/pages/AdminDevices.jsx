/**
 * Admin Devices — tüm cihazları listele.
 */
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/devices')
      .then((res) => setDevices(res.data.devices))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Cihazlar</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Cihaz UUID</th><th>Model</th><th>OS</th><th>Kullanıcı</th><th>Son Görülme</th></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d._id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.deviceUuid}</td>
                <td>{d.model}</td>
                <td>{d.os}</td>
                <td>{d.userId?.name || '—'}</td>
                <td>{new Date(d.lastSeenAt).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
