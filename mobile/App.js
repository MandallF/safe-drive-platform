/**
 * ============================================================
 * Mobil Uygulama Giriş Noktası (App.js)
 * ============================================================
 *
 * NavigationContainer içinde Stack Navigator kuruyoruz.
 * AuthContext token durumuna göre Login veya Home stack'i gösterir.
 * ============================================================
 */
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TripScreen from './src/screens/TripScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Token kontrolü süresince splash benzeri ekran
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff' }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Safe Drive — Giriş' }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Ekran' }} />
          <Stack.Screen name="Trip" component={TripScreen} options={{ title: 'Sürüş Devam Ediyor' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
