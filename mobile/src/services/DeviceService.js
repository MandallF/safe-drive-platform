/**
 * Cihaz UUID üreteci.
 * expo-application Android/iOS'tan kararlı bir cihaz tanımlayıcı verir.
 * Bu olmayan platformlarda (web) random UUID üretip SecureStore'a kaydederiz.
 */
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function getDeviceUuid() {
  let uuid;

  if (Platform.OS === 'android') {
    uuid = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    uuid = await Application.getIosIdForVendorAsync();
  }

  if (uuid) return uuid;

  // Fallback — SecureStore'da sakla
  const stored = await SecureStore.getItemAsync('device_uuid');
  if (stored) return stored;
  const generated = `dev-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  await SecureStore.setItemAsync('device_uuid', generated);
  return generated;
}
