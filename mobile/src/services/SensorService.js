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
      accel: { x: 0, y: 0, z: 0 },   // LİNEER (yerçekimsiz) ivme — gerçek hareket
      gyro: { x: 0, y: 0, z: 0 },
      location: null
    };
    // Yerçekimi tahmini (low-pass filtre). Ham ivmeden çıkarınca telefonun
    // gerçek hareket ivmesi kalır; dik tutulan telefonda sabit ~9.8 offset gider.
    this.gravity = { x: 0, y: 0, z: 0 };
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

    // İvmeölçer (Expo birimi: G; ×9.81 → m/s²). Ham ivme YERÇEKİMİNİ İÇERİR;
    // telefon dik tutulunca bir eksen sürekli ~-9.8 okur (kullanıcının gördüğü
    // "sürekli negatif" değerin sebebi buydu). Sürüş analizi için yerçekimini
    // low-pass filtre ile tahmin edip çıkarıyoruz → LİNEER ivme:
    //   durağan telefon ≈ 0, gerçek fren/dönüş/çukurda sıçrar (eşiklerle uyumlu).
    const GRAVITY_ALPHA = 0.8; // yüksek = yerçekimi tahmini yavaş değişir
    let gravityReady = false;  // ilk örnekte yerçekimini direkt ata (başlangıç sıçramasını önle)
    this.subscriptions.push(
      Accelerometer.addListener(({ x, y, z }) => {
        const ax = x * 9.81, ay = y * 9.81, az = z * 9.81;
        if (!gravityReady) {
          this.gravity = { x: ax, y: ay, z: az };
          gravityReady = true;
        } else {
          this.gravity.x = GRAVITY_ALPHA * this.gravity.x + (1 - GRAVITY_ALPHA) * ax;
          this.gravity.y = GRAVITY_ALPHA * this.gravity.y + (1 - GRAVITY_ALPHA) * ay;
          this.gravity.z = GRAVITY_ALPHA * this.gravity.z + (1 - GRAVITY_ALPHA) * az;
        }
        this.last.accel = {
          x: ax - this.gravity.x,
          y: ay - this.gravity.y,
          z: az - this.gravity.z
        };
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
        // speed m/s gelir; iOS GPS hızı geçersizken -1 döndürür (durağan/kapalı mekân).
        // Negatif/geçersiz değeri 0 say — ekranda "−3.6 km/h" yerine "0 km/h" görünsün.
        const spd = loc.coords.speed;
        this.last.location = {
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
          speed: (typeof spd === 'number' && spd > 0) ? spd * 3.6 : 0
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
