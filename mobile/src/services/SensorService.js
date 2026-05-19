/**
 * ============================================================
 * SensorService — Mobil Veri Toplama Modülü (Föy 5.1)
 * ============================================================
 *
 * Bu servis 3 ana iş yapar:
 *   1) Expo Sensors API'lerinden ivmeölçer + jiroskop dinler
 *   2) Expo Location ile GPS konumu/hızı okur
 *   3) Belirli aralıklarla (default 500ms) bu üçünü birleştirip
 *      callback'e zaman damgalı sample geçer.
 *
 * Pattern: Observer
 *   - start(callback) ile başlat
 *   - stop() ile sustur
 *
 * KRİTİK NOT: Expo Sensors saniyede 100+ örnek üretebilir. Bunları
 * doğrudan API'ye göndermek hem batarya öldürür hem trafiği şişirir.
 * Bu yüzden son okunan değerleri buffer'da tutuyor, SAMPLE_RATE_MS
 * aralığında dış dünyaya yayınlıyoruz.
 * ============================================================
 */

import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';

const SAMPLE_RATE_MS = 500;  // Saniyede 2 sample => yeterli hassasiyet, hafif yük

class SensorService {
  constructor() {
    this.subscriptions = []; // Expo subscription handle'ları
    this.intervalId = null;

    // Son okunan değerler — sensör event'leri buraya yazar, timer buradan okur
    this.last = {
      accel: { x: 0, y: 0, z: 9.8 },
      gyro: { x: 0, y: 0, z: 0 },
      location: null
    };
  }

  /**
   * Konum iznini iste.
   * @returns {boolean} izin verildi mi
   */
  async requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Sensörleri dinlemeye başla.
   * @param {Function} onSample - her sample için çağrılacak callback
   *                              ({ accelX, accelY, accelZ, gyroX, gyroY, gyroZ,
   *                                 lat, lon, speed, timestamp })
   */
  async start(onSample) {
    if (this.intervalId) {
      console.warn('SensorService zaten başlatılmış.');
      return;
    }

    // Sensör update interval — daha az çağrı, daha az batarya
    Accelerometer.setUpdateInterval(200);
    Gyroscope.setUpdateInterval(200);

    // İvmeölçer (Expo birimi: G — yerçekimi katı. m/s²'ye çevirmek için *9.81)
    this.subscriptions.push(
      Accelerometer.addListener(({ x, y, z }) => {
        this.last.accel = { x: x * 9.81, y: y * 9.81, z: z * 9.81 };
      })
    );

    // Jiroskop (Expo birimi: rad/s — istediğimiz birim)
    this.subscriptions.push(
      Gyroscope.addListener(({ x, y, z }) => {
        this.last.gyro = { x, y, z };
      })
    );

    // GPS — sürekli watchPosition. Hız (m/s) ve konum sürekli güncellenir.
    const locSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1
      },
      (loc) => {
        this.last.location = {
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
          // speed m/s gelir — km/h'a çevir (×3.6). null ise 0 say.
          speed: loc.coords.speed ? loc.coords.speed * 3.6 : 0
        };
      }
    );
    this.subscriptions.push({ remove: () => locSub.remove() });

    // Sample timer — son okunan değerlerden bir snapshot yarat ve yayınla
    this.intervalId = setInterval(() => {
      const sample = {
        timestamp: new Date().toISOString(),
        accelX: this.last.accel.x,
        accelY: this.last.accel.y,
        accelZ: this.last.accel.z,
        gyroX: this.last.gyro.x,
        gyroY: this.last.gyro.y,
        gyroZ: this.last.gyro.z,
        lat: this.last.location?.lat,
        lon: this.last.location?.lon,
        speed: this.last.location?.speed || 0
      };
      onSample(sample);
    }, SAMPLE_RATE_MS);
  }

  /**
   * Tüm dinleyicileri durdur ve buffer'ı temizle.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.subscriptions.forEach((s) => s.remove());
    this.subscriptions = [];
    this.last.location = null;
  }
}

// Singleton — tüm uygulamada tek instance
export default new SensorService();
