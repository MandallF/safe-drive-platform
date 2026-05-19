/**
 * TripDetail — Tek bir sürüşün detayı.
 * Üstte özet kartlar, sonra harita (Leaflet) ve zaman serisi grafiği.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

// Leaflet default icon Webpack/Vite ile gelmez — manuel ayarlıyoruz
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Alarm noktaları için kırmızı icon
const alarmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/trips/${id}`),
      api.get(`/sensor-data/trip/${id}`),
      api.get(`/alarms?tripId=${id}`)
    ]).then(([t, s, a]) => {
      setTrip(t.data.trip);
      setSensorData(s.data.data);
      setAlarms(a.data.alarms);
    });
  }, [id]);

  if (!trip) return <div>Yükleniyor...</div>;

  // Harita için rota noktaları
  const routePoints = sensorData
    .filter((s) => s.lat && s.lon)
    .map((s) => [s.lat, s.lon]);

  const mapCenter = routePoints[0] || [40.197, 29.060]; // Bursa default

  // Grafik
  const chartData = {
    labels: sensorData.map((s) => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'İvme Y (m/s²)',
        data: sensorData.map((s) => s.accelY),
        borderColor: '#2563eb',
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: 'Hız (km/h)',
        data: sensorData.map((s) => s.speed),
        borderColor: '#10b981',
        tension: 0.2,
        yAxisID: 'y1',
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { position: 'left' },
      y1: { position: 'right', grid: { drawOnChartArea: false } }
    }
  };

  return (
    <div>
      <h1>Sürüş Detayı</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Süre</div>
          <div className="value" style={{ fontSize: 22 }}>
            {trip.endedAt
              ? `${Math.round((new Date(trip.endedAt) - new Date(trip.startedAt)) / 60000)} dk`
              : 'Devam ediyor'}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Mesafe</div>
          <div className="value">{(trip.distanceMeters / 1000).toFixed(2)} km</div>
        </div>
        <div className="stat-card">
          <div className="label">Ortalama Hız</div>
          <div className="value">{trip.avgSpeedKmh}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maks. Hız</div>
          <div className="value">{trip.maxSpeedKmh}</div>
        </div>
        <div className="stat-card">
          <div className="label">Alarm</div>
          <div className="value">{trip.alarmCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Risk Skoru</div>
          <div className="value" style={{ color: trip.riskScore > 60 ? '#dc2626' : trip.riskScore > 30 ? '#f59e0b' : '#10b981' }}>
            {trip.riskScore}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Rota Haritası</h3>
        {routePoints.length === 0 ? (
          <p style={{ color: '#6b7280' }}>GPS verisi bulunamadı.</p>
        ) : (
          <div className="map-container">
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={routePoints} color="#2563eb" weight={4} />
              {alarms.filter(a => a.lat && a.lon).map((alarm) => (
                <Marker key={alarm._id} position={[alarm.lat, alarm.lon]} icon={alarmIcon}>
                  <Popup>
                    <strong>{alarm.type}</strong><br />
                    {alarm.details}<br />
                    <small>{new Date(alarm.timestamp).toLocaleTimeString()}</small>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Zaman Serisi Grafik</h3>
        {sensorData.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Sensör verisi yok.</p>
        ) : (
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="card">
        <h3>Bu Sürüşteki Alarmlar ({alarms.length})</h3>
        <table>
          <thead>
            <tr><th>Zaman</th><th>Tür</th><th>Şiddet</th><th>Açıklama</th></tr>
          </thead>
          <tbody>
            {alarms.map(a => (
              <tr key={a._id}>
                <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                <td>{a.type}</td>
                <td><span className={`badge ${a.severity}`}>{a.severity}</span></td>
                <td>{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
