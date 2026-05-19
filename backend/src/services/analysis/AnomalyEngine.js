/**
 * ============================================================
 * AnomalyEngine — Trip Başına Stateful Analiz Motoru
 * ============================================================
 *
 * Detektörler saf fonksiyonlar; ama gerçek dünyada her ölçüm bağımsız
 * değerlendirilmez — önceki ölçüme, son saniyenin trendine bakmak gerekir.
 * Bu stateful bölümü AnomalyEngine yönetir.
 *
 * Her aktif trip için bir engine instance'ı yaratıyoruz (Map ile cache).
 * Bu sayede:
 *   - MovingAverage buffer'ı trip'e özgü
 *   - Önceki sample referansı korunuyor
 *   - Aynı alarm türünden çok kısa sürede ardarda üretilmesini önleyebiliyoruz
 *     (debounce — bir ani frenden hemen sonra ikinci alarm üretmesin)
 *
 * Bellek tüketimi: Trip kapatıldığında engine destroy edilmeli (engineRegistry).
 * ============================================================
 */

const { MovingAverage } = require('./smoothing');
const { runAllDetectors } = require('./detectors');
const T = require('./thresholds');

// Aynı tür alarmın yeniden tetiklenmesi için bekleme süresi (ms).
// Bu olmazsa tek bir uzun fren olayı 5-10 alarm üretebilir.
const DEBOUNCE_MS = 3000; // 3 saniye

class AnomalyEngine {
  constructor(tripId) {
    this.tripId = tripId;
    this.smoother = new MovingAverage(5);
    this.previousSmoothed = null;
    this.lastAlarmAt = {}; // { hard_brake: <timestamp>, sharp_turn: <timestamp>, ... }
  }

  /**
   * Bir sensör örneğini analiz et.
   * @returns {Array} bulunan & debounce'ı geçen anomaliler
   */
  process(sample) {
    // 1) Yumuşat
    const smoothed = this.smoother.push(sample);

    // 2) Detektörleri çalıştır
    const candidates = runAllDetectors(smoothed, this.previousSmoothed);

    // 3) Debounce filtresi — son X ms'de aynı tipten alarm üretildiyse atla
    const now = sample.timestamp instanceof Date
      ? sample.timestamp.getTime()
      : new Date(sample.timestamp).getTime();

    const accepted = [];
    for (const anomaly of candidates) {
      const lastAt = this.lastAlarmAt[anomaly.type] || 0;
      if (now - lastAt < DEBOUNCE_MS) {
        continue; // çok yakın, atla
      }
      this.lastAlarmAt[anomaly.type] = now;
      accepted.push(anomaly);
    }

    // 4) Sonraki çağrı için kaydet
    this.previousSmoothed = smoothed;

    return accepted;
  }

  /**
   * Trip kapanırken risk skorunu hesapla.
   * Skor = sum(severity_weight) * 10 / dakika — yani dakikada kaç ağırlıklı alarm.
   * 0-100 arası clamp edilir.
   *
   * @param {Array<{severity}>} alarms - bu trip'te oluşan tüm alarmlar
   * @param {number} durationMinutes - trip süresi (dakika)
   */
  static calculateRiskScore(alarms, durationMinutes) {
    if (!alarms.length || durationMinutes <= 0) return 0;

    const weightSum = alarms.reduce(
      (acc, a) => acc + (T.SEVERITY_WEIGHTS[a.severity] || 1),
      0
    );
    const perMinute = weightSum / durationMinutes;
    const score = perMinute * 10;
    return Math.min(100, Math.round(score));
  }
}

// ============================================================
// Engine Registry — aktif trip'ler için engine cache'i
// ============================================================
// Bellek-içi Map. Sunucu yeniden başlarsa kaybolur — bu OK çünkü
// engine state geçicidir, anlamlı veriler DB'dedir.
const engineRegistry = new Map();

function getEngine(tripId) {
  const key = tripId.toString();
  if (!engineRegistry.has(key)) {
    engineRegistry.set(key, new AnomalyEngine(key));
  }
  return engineRegistry.get(key);
}

function destroyEngine(tripId) {
  engineRegistry.delete(tripId.toString());
}

module.exports = {
  AnomalyEngine,
  getEngine,
  destroyEngine
};
