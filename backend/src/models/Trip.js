/**
 * ============================================================
 * Trip (Sürüş) Modeli
 * ============================================================
 *
 * Bir "sürüş oturumu"nu temsil eder. Sürücü mobilde "Başlat" butonuna
 * bastığında bir Trip açılır, "Durdur" deyince kapanır. Sensör verileri
 * bu trip'e bağlanır (SensorData.tripId).
 *
 * Niye trip kavramına ihtiyacımız var?
 *   - Sürücüye "bugünkü sürüşünde 3 ani fren yaptın" diyebilmek için
 *     verileri oturuma göre gruplamak gerek.
 *   - Trip özeti (toplam mesafe, ortalama hız, alarm sayısı) önceden
 *     hesaplanıp burada saklanırsa dashboard hızlı yüklenir
 *     (aggregation her seferinde çalışmaz).
 *
 * 'endedAt' null ise trip hâlâ aktiftir.
 * ============================================================
 */

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null             // null => henüz devam ediyor
  },
  // Özet alanları — trip kapatılırken hesaplanır
  distanceMeters: { type: Number, default: 0 },
  avgSpeedKmh: { type: Number, default: 0 },
  maxSpeedKmh: { type: Number, default: 0 },
  alarmCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 }  // 0-100 arası; yüksek = riskli sürüş
}, {
  timestamps: true
});

// Birleşik index: kullanıcının trip'lerini en yeniden eskiye listelemek hızlı olsun
tripSchema.index({ userId: 1, startedAt: -1 });

/**
 * "Bu trip aktif mi?" sorusuna kolay erişim için virtual.
 * Schema'da gerçek field yok ama trip.isActive ile boolean alabilir,
 * frontend'e response.isActive olarak dönebiliriz.
 */
tripSchema.virtual('isActive').get(function () {
  return this.endedAt === null;
});

// virtual'ların JSON'a yansıması için
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
