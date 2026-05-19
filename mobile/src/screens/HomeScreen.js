/**
 * HomeScreen — sürücünün ana ekranı.
 * "Sürüş Başlat" butonu ile Trip ekranına geçer.
 * Son sürüşlerini listeler.
 */
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchTrips() {
    setRefreshing(true);
    try {
      const res = await api.get('/trips?limit=10');
      setTrips(res.data.trips);
    } catch (err) {
      // Sessiz geç — offline'da bile kullanıcı sürüş başlatabilsin
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  function startTrip() {
    navigation.navigate('Trip');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bigButton} onPress={startTrip}>
        <Text style={styles.bigButtonIcon}>🚗</Text>
        <Text style={styles.bigButtonText}>Sürüş Başlat</Text>
        <Text style={styles.bigButtonHint}>Sensörler aktive edilecek</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Son Sürüşler</Text>
      <FlatList
        data={trips}
        keyExtractor={(t) => t._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTrips} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz sürüş yok. İlk sürüşünüzü başlatın!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Text style={styles.tripDate}>{new Date(item.startedAt).toLocaleString('tr-TR')}</Text>
            <View style={styles.tripRow}>
              <Text style={styles.tripMeta}>
                {(item.distanceMeters / 1000).toFixed(2)} km · {item.alarmCount} alarm
              </Text>
              <Text style={[styles.riskBadge, {
                color: item.riskScore > 60 ? '#dc2626' : item.riskScore > 30 ? '#f59e0b' : '#10b981'
              }]}>
                Risk {item.riskScore}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13, color: '#6b7280' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  logout: { color: '#dc2626', fontSize: 14 },
  bigButton: {
    backgroundColor: '#2563eb',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32
  },
  bigButtonIcon: { fontSize: 48 },
  bigButtonText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  bigButtonHint: { color: '#cfe1ff', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
  tripCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  tripDate: { fontSize: 13, color: '#6b7280' },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  tripMeta: { fontSize: 14 },
  riskBadge: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 }
});
