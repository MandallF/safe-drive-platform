/**
 * ============================================================
 * Anomali Detektörleri (Eşik Tabanlı Algoritmalar)
 * ============================================================
 *
 * Her detector saf bir fonksiyondur:
 *   Input  : { sample, previousSample } — anlık sensör ölçümü + öncekisi
 *   Output : null  (anomali yok)  veya
 *            { type, severity, measuredValue, threshold, details }
 *
 * Saf fonksiyon olması TEST EDİLEBİLİRLİĞİ artırır — DB gerekmeden
 * Jest ile bilinen senaryolarla doğrulayabiliriz.
 *
 * Algoritmaların özeti:
 *   1) detectHardBrake     : Y ekseni ivmesi çok negatif (ani fren)
 *   2) detectRapidAccel    : Y ekseni ivmesi çok pozitif (ani hızlanma)
 *   3) detectSharpTurn     : Jiroskop Z dönüş hızı yüksek (sert dönüş)
 *   4) detectShake         : İvme magnitude eşiği aştı (sarsıntı/çarpma)
 *   5) detectSpeeding      : GPS hızı saniyede çok arttı (beklenmeyen hızlanma)
 *
 * "Güzergâh dışı" detektörü opsiyonel — önceden tanımlı rotaya ihtiyaç
 * duyduğu için MVP'de yok, bonus özellik olarak eklenebilir.
 * ============================================================
 */

const T = require('./thresholds');

/**
 * Severity hesaplayıcı — ihlal miktarına göre low/medium/high döner.
 * @param {number} ratio - measured/threshold oranı (her zaman pozitif)
 */
function classifySeverity(ratio) {
  if (ratio >= T.SEVERITY.HIGH_MULTIPLIER) return 'high';
  if (ratio >= T.SEVERITY.MEDIUM_MULTIPLIER) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------
// 1) Ani Fren Detektörü
// ---------------------------------------------------------------------
function detectHardBrake(sample) {
  // accelY negatif olduğunda fren demektir.
  // Eşik -3 m/s². Bundan daha negatifse (yani daha sert fren) alarm.
  if (sample.accelY >= T.HARD_BRAKE_MS2) return null;

  const ratio = Math.abs(sample.accelY) / Math.abs(T.HARD_BRAKE_MS2);
  return {
    type: 'hard_brake',
    severity: classifySeverity(ratio),
    measuredValue: sample.accelY,
    threshold: T.HARD_BRAKE_MS2,
    details: `Ani fren tespit edildi: ${sample.accelY.toFixed(2)} m/s² (esik: ${T.HARD_BRAKE_MS2})`
  };
}

// ---------------------------------------------------------------------
// 2) Ani Hızlanma Detektörü
// ---------------------------------------------------------------------
function detectRapidAcceleration(sample) {
  if (sample.accelY <= T.RAPID_ACCEL_MS2) return null;

  const ratio = sample.accelY / T.RAPID_ACCEL_MS2;
  return {
    type: 'rapid_acceleration',
    severity: classifySeverity(ratio),
    measuredValue: sample.accelY,
    threshold: T.RAPID_ACCEL_MS2,
    details: `Ani hizlanma: ${sample.accelY.toFixed(2)} m/s² (esik: ${T.RAPID_ACCEL_MS2})`
  };
}

// ---------------------------------------------------------------------
// 3) Sert Dönüş Detektörü
// ---------------------------------------------------------------------
function detectSharpTurn(sample) {
  // Jiroskop Z-ekseni mutlak değeri eşik aşmışsa
  const absGyroZ = Math.abs(sample.gyroZ);
  if (absGyroZ <= T.SHARP_TURN_RAD) return null;

  const ratio = absGyroZ / T.SHARP_TURN_RAD;
  return {
    type: 'sharp_turn',
    severity: classifySeverity(ratio),
    measuredValue: sample.gyroZ,
    threshold: T.SHARP_TURN_RAD,
    details: `Sert donus: ${sample.gyroZ.toFixed(2)} rad/s (esik: ±${T.SHARP_TURN_RAD})`
  };
}

// ---------------------------------------------------------------------
// 4) Sarsıntı Detektörü
// ---------------------------------------------------------------------
function detectShake(sample) {
  // Toplam ivme magnitude = sqrt(x² + y² + z²)
  // Yerçekimi dahil olduğu için durağan telefonda bile ~9.81 olur.
  // Eşik 15 m/s² seçildi — sıradan sürüşte bu aşılmaz.
  const magnitude = Math.sqrt(
    sample.accelX * sample.accelX +
    sample.accelY * sample.accelY +
    sample.accelZ * sample.accelZ
  );

  if (magnitude <= T.SHAKE_MAGNITUDE_MS2) return null;

  const ratio = magnitude / T.SHAKE_MAGNITUDE_MS2;
  return {
    type: 'shake',
    severity: classifySeverity(ratio),
    measuredValue: magnitude,
    threshold: T.SHAKE_MAGNITUDE_MS2,
    details: `Sarsinti esigi asildi: ${magnitude.toFixed(2)} m/s² (esik: ${T.SHAKE_MAGNITUDE_MS2})`
  };
}

// ---------------------------------------------------------------------
// 5) Beklenmeyen Hızlanma (GPS bazlı) Detektörü
// ---------------------------------------------------------------------
function detectSpeeding(sample, previousSample) {
  // İki ölçüm arasındaki hız farkı / zaman farkı = hız değişim oranı
  if (!previousSample) return null;
  if (typeof sample.speed !== 'number' || typeof previousSample.speed !== 'number') return null;

  const deltaSeconds = (sample.timestamp - previousSample.timestamp) / 1000;
  if (deltaSeconds <= 0 || deltaSeconds > 5) {
    // 0 veya 5sn'den büyük fark mantıksız — atla.
    return null;
  }

  const deltaKmh = sample.speed - previousSample.speed;
  const deltaPerSecond = deltaKmh / deltaSeconds;

  if (deltaPerSecond <= T.SPEEDING_DELTA_KMH_PER_SEC) return null;

  const ratio = deltaPerSecond / T.SPEEDING_DELTA_KMH_PER_SEC;
  return {
    type: 'speeding',
    severity: classifySeverity(ratio),
    measuredValue: deltaPerSecond,
    threshold: T.SPEEDING_DELTA_KMH_PER_SEC,
    details: `Beklenmeyen hizlanma: ${deltaPerSecond.toFixed(1)} km/h/sn (esik: ${T.SPEEDING_DELTA_KMH_PER_SEC})`
  };
}

/**
 * Tüm detektörleri sırayla çalıştırıp bulunanları döner.
 * @returns {Array} - bulunan anomaliler ([] = anomali yok)
 */
function runAllDetectors(sample, previousSample) {
  const results = [
    detectHardBrake(sample),
    detectRapidAcceleration(sample),
    detectSharpTurn(sample),
    detectShake(sample),
    detectSpeeding(sample, previousSample)
  ];
  return results.filter(Boolean);
}

module.exports = {
  detectHardBrake,
  detectRapidAcceleration,
  detectSharpTurn,
  detectShake,
  detectSpeeding,
  runAllDetectors,
  classifySeverity
};
