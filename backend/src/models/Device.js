/**
 * ============================================================
 * Device Modeli
 * ============================================================
 *
 * Sürücünün telefonu = "Device". Bir kullanıcının birden fazla telefonu
 * olabileceği için User <-> Device ilişkisi 1:N (one-to-many).
 *
 * Niye ayrı bir model? Föy 5.4 "cihaz bilgileri" alanını ayrı tutmamızı
 * istiyor. Ayrıca aynı kullanıcının iki farklı arabasındaki iki telefonu
 * birbirinden ayırmak için 'deviceId' gerekiyor.
 * ============================================================
 */

const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',              // populate ile User dokümanına ulaşabiliriz
    required: true,
    index: true               // userId üzerinden sorgu çok yapılacak — indexlendi
  },
  deviceUuid: {
    type: String,
    required: true,
    unique: true,
    // Mobil uygulamada Expo'nun ürettiği UUID. Aynı telefondan ikinci kez kayıt
    // yapılırsa upsert ile mevcut kayıt güncellenir, çift kayıt oluşmaz.
  },
  model: {
    type: String,
    default: 'Bilinmiyor'     // ör: "Pixel 7", "iPhone 14"
  },
  os: {
    type: String,
    enum: ['ios', 'android', 'web', 'unknown'],
    default: 'unknown'
  },
  lastSeenAt: {
    type: Date,
    default: Date.now         // her veri geldiğinde controller bu alanı günceller
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
