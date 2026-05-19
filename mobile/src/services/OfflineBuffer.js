/**
 * ============================================================
 * OfflineBuffer — İnternet Kesintilerine Karşı Dayanıklılık
 * ============================================================
 *
 * Sensör verisi sürekli akıyor; ama internet bağlantısı kopabilir
 * (tünel, kapsama dışı bölge vs.). Veri kaybetmemek için:
 *   - HTTP isteği başarısızsa sample'ı AsyncStorage'a kaydet
 *   - Bağlantı geri geldiğinde kuyruğu boşalt
 *
 * AsyncStorage'da JSON dizisi olarak saklıyoruz. 1000 sample limit'i —
 * daha fazlası taşma korkusu, en eski örnekler silinir (FIFO).
 *
 * Föy bonus: "Mobil istemcide çevrimdışı veri tamponlama" özelliği.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sensor_buffer';
const MAX_SIZE = 1000;

class OfflineBuffer {
  async enqueue(sample) {
    try {
      const existing = await this.getAll();
      const next = [...existing, sample];
      // Limit kontrolü — taşarsa en eskileri at
      const trimmed = next.length > MAX_SIZE ? next.slice(-MAX_SIZE) : next;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('OfflineBuffer enqueue hatası:', err);
    }
  }

  async getAll() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async clear() {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async size() {
    const list = await this.getAll();
    return list.length;
  }
}

export default new OfflineBuffer();
