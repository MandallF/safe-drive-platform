/**
 * LoginScreen — email/parola ile giriş.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('driver@example.com');
  const [password, setPassword] = useState('driver123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Giriş başarısız', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚗 Safe Drive</Text>
      <Text style={styles.subtitle}>Sürücü Mobil İstemcisi</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Parola</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Giriş Yap</Text>}
      </TouchableOpacity>

      <View style={styles.hint}>
        <Text style={styles.hintTitle}>Demo:</Text>
        <Text style={styles.hintText}>driver@example.com / driver123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8fafc' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#2563eb', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 13, color: '#1f2937', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 15 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { marginTop: 32, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6 },
  hintTitle: { fontSize: 12, fontWeight: '600', color: '#475569' },
  hintText: { fontSize: 12, color: '#475569', marginTop: 4 }
});
