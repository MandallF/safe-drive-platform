/**
 * ============================================================
 * Veri Yumuşatma (Smoothing) — Gürültü Filtreleme
 * ============================================================
 *
 * Telefon ivmeölçeri yüksek frekanslı gürültü içerir (motor titreşimi,
 * yol pürüzleri, telefonun kucakta sallanması...). Ham veriyi doğrudan
 * eşiklere sokarsak false-positive bombardımanına uğrarız.
 *
 * Çözüm: Hareketli ortalama (moving average) — son N örneğin ortalamasını al.
 * Bu, kısa süreli ani zıplamaları yumuşatır, asıl trendi (gerçek fren,
 * gerçek dönüş) korur.
 *
 * 5'lik pencere (window=5) saniyede 2 örnek için 2.5 saniyelik yumuşatma
 * demektir — ani fren olayını yakalayacak kadar dar, gürültüyü silecek kadar geniş.
 * ============================================================
 */

class MovingAverage {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.buffer = [];
  }

  /**
   * Yeni örnek ekle, yumuşatılmış değeri döndür.
   * @param {Object} sample - { accelX, accelY, accelZ, gyroX, gyroY, gyroZ, speed, ... }
   * @returns {Object} yumuşatılmış sample (timestamp ve lat/lon korunur)
   */
  push(sample) {
    this.buffer.push(sample);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift(); // FIFO — en eski örneği at
    }

    const n = this.buffer.length;
    const avg = (field) =>
      this.buffer.reduce((sum, s) => sum + (s[field] || 0), 0) / n;

    return {
      ...sample,  // timestamp, lat, lon, vs. orijinal kalsın
      accelX: avg('accelX'),
      accelY: avg('accelY'),
      accelZ: avg('accelZ'),
      gyroX: avg('gyroX'),
      gyroY: avg('gyroY'),
      gyroZ: avg('gyroZ'),
      speed: avg('speed')
    };
  }

  reset() {
    this.buffer = [];
  }
}

module.exports = { MovingAverage };
