/**
 * ============================================================
 * Anomali Tespit Eşik Değerleri
 * ============================================================
 *
 * Tüm "magic number"ları tek bir dosyada topladık. Bu sayede:
 *   - Gerçek araç testinden gelen verilerle ince ayar yaparken
 *     yalnızca burayı değiştirmemiz yetiyor.
 *   - Algoritmaların okunabilirliği artıyor: kodda 3 yerine
 *     T.HARD_BRAKE_MS2 görmek anlamlı.
 *   - Sunumda "eşik değerleri nasıl seçtiniz?" sorusuna cevap
 *     ararken tek bakacağınız dosya bu olacak.
 *
 * Değerlerin gerekçesi:
 *   - Ani fren -3 m/s²: Araştırmalarda agresif fren genellikle
 *     -3 ile -5 m/s² arası kabul ediliyor. Tutucu (sensitive)
 *     başlangıç değeri olarak -3 seçildi.
 *   - Sert dönüş 0.5 rad/s: Normal şehir içi dönüşler ≈ 0.2 rad/s,
 *     agresif dönüşler 0.5+ üzerine çıkar.
 *   - Sarsıntı 15 m/s²: Yerçekimi 9.81 m/s² olduğundan, hareket
 *     halindeki bir araçta toplam ivme magnitude'unun 15'i geçmesi
 *     ciddi bir sarsıntı/çarpma işaretidir.
 *
 * Bu değerler gerçek sürüş verisiyle KALİBRE EDİLMELİDİR.
 * Şu an ki değerler literatür + makul ön tahminler.
 * ============================================================
 */

module.exports = {
  // İvmeölçer Y-ekseni (m/s²) — boylamsal ivme
  // Negatif değer => fren, pozitif => hızlanma
  HARD_BRAKE_MS2: -3.0,
  RAPID_ACCEL_MS2: 3.0,

  // Jiroskop Z-ekseni (rad/s) — dikey eksen etrafında dönme
  // Yüksek değer => sert dönüş veya savrulma
  SHARP_TURN_RAD: 0.5,

  // İvme magnitude (m/s²) = sqrt(x²+y²+z²)
  // Tek bir eksende değil her yöndeki toplam sarsıntı
  SHAKE_MAGNITUDE_MS2: 15.0,

  // GPS hızı değişimi (km/h / saniye)
  // Çok hızlı ivmelenme — sürücü trafikte zikzak yapıyor olabilir
  SPEEDING_DELTA_KMH_PER_SEC: 10.0,

  // Severity sınıflandırması için katsayılar.
  // İhlal miktarı arttıkça severity yükselir.
  SEVERITY: {
    LOW_MULTIPLIER: 1.0,   // eşiğin 1x üstü
    MEDIUM_MULTIPLIER: 1.5, // eşiğin 1.5x üstü
    HIGH_MULTIPLIER: 2.0   // eşiğin 2x üstü
  },

  // Risk skoru hesaplaması için severity ağırlıkları
  SEVERITY_WEIGHTS: {
    low: 1,
    medium: 3,
    high: 5
  }
};
