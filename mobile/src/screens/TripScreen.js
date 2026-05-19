/**
 * ============================================================
 * TripScreen — Aktif Sürüş Ekranı
 * ============================================================
 *
 * "Sürüş Başlat" basıldığında bu ekran açılır. Burada:
 *   1) Backend'te Trip oluştur (POST /api/trips/start)
 *   2) SensorService.start() ile sensörleri dinle
 *   3) Her sample'ı:
 *      - UI'da göster (anlık ivme + hız)
 *      - Batch buffer'a ekle
 *   4) Her 3 saniyede bir batch'i backend'e POST et
 *   5) Hata olursa OfflineBuffer'a yaz
 *   6) "Durdur" basılınca trip'i kapat
 *
 * Batch boyutu önemli: çok küçükse trafiği şişirir, çok büyükse
 * gerçek-zamanlılık azalır. 3 saniyede 6 sample (saniyede 2) = sweet spot.
 * ============================================================
 */
import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import SensorService from '../services/SensorService';
import OfflineBuffer from '../services/OfflineBuffer';
import { getDeviceUuid } from '../services/DeviceService';
import api from '../services/api';

const BATCH_INTERVAL_MS = 3000;

export default function TripScreen({ navigation }) {
  const [trip, setTrip] = useState(null);
  const [latest, setLatest] = useState(null);
  const [stats, setStats] = useState({ sent: 0, queued: 0, alarms: 0 });
  const [stopping, setStopping] = useState(false);

  const bufferRef = useRef([]);     // batch'lenmemiş sampleslar
  const deviceUuidRef = useRef(null);
  const flushIntervalRef = useRef(null);

  // ----- Trip başlat -----
  useEffect(() => {
    (async () => {
      try {
        // 1) İzinler
        const granted = await SensorService.requestPermissions();
        if (!granted) {
          Alert.alert('İzin gerekli', 'Sürüş analizi için konum izni şart.');
          navigation.goBack();
          return;
        }

        // 2) Device UUID
        const deviceUuid = await getDeviceUuid();
        deviceUuidRef.current = deviceUuid;

        // 3) Backend'te trip aç
        const res = await api.post('/trips/start', { deviceUuid });
        setTrip(res.data.trip);

        // 4) Önceki offline kuyruğu varsa boşalt
        await flushOfflineBuffer();

        // 5) Sensörleri başlat
        await SensorService.start((sample) => {
          setLatest(sample);
          bufferRef.current.push(sample);
        });

        // 6) Batch gönderim timer'ı
        flushIntervalRef.current = setInterval(flushBatch, BATCH_INTERVAL_MS);
      } catch (err) {
        Alert.alert('Sürüş başlatılamadı', err.response?.data?.message || err.message);
        navigation.goBack();
      }
    })();

    return () => {
      // Cleanup — ekran kapatılırsa sensörleri durdur
      SensorService.stop();
      if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
    };
  }, []);

  /**
   * Buffer'daki sample'ları batch olarak gönder.
   * Hata durumunda OfflineBuffer'a yaz, sonra dene.
   */
  async function flushBatch() {
    if (bufferRef.current.length === 0 || !trip) return;

    const batch = bufferRef.current;
    bufferRef.current = []; // reset

    const samples = batch.map((s) => ({
      ...s,
      tripId: trip._id,
      deviceUuid: deviceUuidRef.current
    }));

    try {
      const res = await api.post('/sensor-data', { samples });
      setStats((prev) => ({
        sent: prev.sent + samples.length,
        queued: prev.queued,
        alarms: prev.alarms + (res.data.alarmsTriggered || 0)
      }));
    } catch (err) {
      // Offline: buffer'a yaz
      for (const s of samples) {
        await OfflineBuffer.enqueue(s);
      }
      const q = await OfflineBuffer.size();
      setStats((prev) => ({ ...prev, queued: q }));
    }
  }

  /**
   * Offline buffer'ı backend'e boşalt (bağlantı geri geldiğinde).
   */
  async function flushOfflineBuffer() {
    const queued = await OfflineBuffer.getAll();
    if (queued.length === 0) return;

    try {
      await api.post('/sensor-data', { samples: queued });
      await OfflineBuffer.clear();
      setStats((prev) => ({ ...prev, queued: 0 }));
    } catch {
      // Hâlâ offline — sonraki denemede tekrar
    }
  }

  // ----- Trip'i kapat -----
  async function stopTrip() {
    if (!trip || stopping) return;
    setStopping(true);

    // Önce son batch'i gönder
    await flushBatch();
    await flushOfflineBuffer();

    // Sensörleri durdur
    SensorService.stop();
    if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);

    try {
      await api.post(`/trips/${trip._id}/end`);
      Alert.alert('Sürüş tamamlandı', `${stats.sent} örnek gönderildi, ${stats.alarms} alarm.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'Sürüş kapatılamadı: ' + err.message);
      setStopping(false);
    }
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12 }}>Sürüş başlatılıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>● Sürüş Aktif</Text>
      </View>

      {/* Anlık hız — büyük göstergeli */}
      <View style={styles.speedCard}>
        <Text style={styles.speedValue}>{Math.round(latest?.speed || 0)}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* Sensör değerleri */}
      <View style={styles.grid}>
        <SensorCell label="İvme X" value={latest?.accelX?.toFixed(2)} unit="m/s²" />
        <SensorCell label="İvme Y" value={latest?.accelY?.toFixed(2)} unit="m/s²" />
        <SensorCell label="İvme Z" value={latest?.accelZ?.toFixed(2)} unit="m/s²" />
        <SensorCell label="Jiro Z" value={latest?.gyroZ?.toFixed(2)} unit="rad/s" />
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <Stat label="Gönderilen" value={stats.sent} />
        <Stat label="Bekleyen" value={stats.queued} color={stats.queued > 0 ? '#f59e0b' : undefined} />
        <Stat label="Alarm" value={stats.alarms} color={stats.alarms > 0 ? '#dc2626' : undefined} />
      </View>

      <TouchableOpacity style={styles.stopButton} onPress={stopTrip} disabled={stopping}>
        {stopping
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.stopButtonText}>SÜRÜŞÜ DURDUR</Text>}
      </TouchableOpacity>
    </View>
  );
}

function SensorCell({ label, value, unit }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value ?? '—'}</Text>
      <Text style={styles.cellUnit}>{unit}</Text>
    </View>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginBottom: 16 },
  statusText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  speedCard: { backgroundColor: '#2563eb', padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  speedValue: { fontSize: 80, fontWeight: 'bold', color: '#fff' },
  speedUnit: { fontSize: 16, color: '#cfe1ff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  cell: { backgroundColor: '#fff', padding: 12, borderRadius: 10, width: '48%', marginBottom: 10 },
  cellLabel: { fontSize: 12, color: '#6b7280' },
  cellValue: { fontSize: 22, fontWeight: '600', marginTop: 4 },
  cellUnit: { fontSize: 11, color: '#9ca3af' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  stat: { backgroundColor: '#fff', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#6b7280' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  stopButton: { backgroundColor: '#dc2626', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  stopButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});
