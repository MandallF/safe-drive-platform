/**
 * ============================================================
 * Dashboard Sayfası — Gerçek Zamanlı Veri Akışı
 * ============================================================
 *
 * Bu sayfa föy 5.5 "gerçek zamanlı veri güncellemesi" gereksinimini
 * doğrudan karşılar.
 *
 * Ne yapar?
 *   1) Backend'ten son trip + alarm istatistiklerini çeker
 *   2) Socket.io 'sensor:data' event'ini dinler — her gelen veriyi grafiğe ekler
 *   3) 'alarm:new' event'ini dinler — alarm sayacını günceller (toast Layout'tan gelir)
 *   4) Son 50 örneği kayan zaman penceresi olarak gösterir
 * ============================================================
 */
import { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/api';
import { getSocket } from '../services/socket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MAX_POINTS = 50; // grafik penceresi

export default function Dashboard() {
  const [stats, setStats] = useState({ tripCount: 0, alarmCount: 0, activeTrip: null });
  const [liveData, setLiveData] = useState([]); // son 50 sample
  const liveDataRef = useRef([]);  // ref ile state'i kapatma sorunu çözüyoruz

  useEffect(() => {
    // İlk yükleme: özet veriler
    loadStats();

    // Canlı veri akışı için socket'i dinle
    const socket = getSocket();
    function handleSensor(sample) {
      const next = [...liveDataRef.current, sample].slice(-MAX_POINTS);
      liveDataRef.current = next;
      setLiveData(next);
    }
    function handleAlarm() {
      // Alarm sayacını arttır
      setStats((prev) => ({ ...prev, alarmCount: prev.alarmCount + 1 }));
    }
    socket.on('sensor:data', handleSensor);
    socket.on('alarm:new', handleAlarm);

    return () => {
      socket.off('sensor:data', handleSensor);
      socket.off('alarm:new', handleAlarm);
    };
  }, []);

  async function loadStats() {
    try {
      const [trips, alarms] = await Promise.all([
        api.get('/trips?limit=1'),
        api.get('/alarms?limit=1')
      ]);
      const tripList = await api.get('/trips?limit=100');
      const activeTrip = tripList.data.trips.find((t) => !t.endedAt);
      setStats({
        tripCount: trips.data.total,
        alarmCount: alarms.data.total,
        activeTrip
      });
    } catch (err) {
      console.error('Dashboard yükleme hatası:', err);
    }
  }

  // Grafik verisi — son 50 sample'ın ivme ve hızı
  const chartData = {
    labels: liveData.map((s) => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'İvme Y (m/s²)',
        data: liveData.map((s) => s.accelY),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3
      },
      {
        label: 'Hız (km/h)',
        data: liveData.map((s) => s.speed),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,  // canlı veri için animasyon kapatıldı
    scales: {
      y: { type: 'linear', position: 'left', title: { display: true, text: 'İvme (m/s²)' } },
      y1: { type: 'linear', position: 'right', title: { display: true, text: 'Hız (km/h)' }, grid: { drawOnChartArea: false } }
    }
  };

  return (
    <div>
      <h1>Gerçek Zamanlı İzleme</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Toplam Sürüş</div>
          <div className="value">{stats.tripCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Toplam Alarm</div>
          <div className="value">{stats.alarmCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Aktif Sürüş</div>
          <div className="value" style={{ fontSize: 16 }}>
            {stats.activeTrip ? (
              <span className="badge active">Sürüyor</span>
            ) : (
              <span className="badge ended">Yok</span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Canlı Örnek</div>
          <div className="value">{liveData.length}/{MAX_POINTS}</div>
        </div>
      </div>

      <div className="card">
        <h3>Anlık Sensör Verisi</h3>
        {liveData.length === 0 ? (
          <p style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>
            Henüz canlı veri yok. Sürüş başladığında veriler burada görünecek.
          </p>
        ) : (
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
