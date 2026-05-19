/**
 * ============================================================
 * Alarm Modeli
 * ============================================================
 *
 * Anomali tespit servisi bir riskli durum (ani fren, sert dönüş vb.)
 * algıladığında bir Alarm dokümanı oluşturur ve Socket.io ile
 * dashboard'a yayınlar.
 *
 * Föy 5.7: "Alarm kayıtları listelenebilmelidir" gereksinimini
 * karşılamak için bu modele ihtiyacımız var.
 *
 * Severity (önem derecesi) skalası:
 *   - low    : Eşiği biraz aşmış, dikkat çekici ama tehlikeli değil
 *   - medium : Klasik ihlal — örn. -3.5 m/s² fren
 *   - high   : Şiddetli ihlal — örn. -6 m/s² fren, kaza riski
 *
 * Risk skoru hesaplanırken severity'e ağırlık verilir (low=1, medium=3, high=5).
 * ============================================================
 */

const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'hard_brake',         // Ani fren
      'rapid_acceleration', // Ani hızlanma
      'sharp_turn',         // Sert dönüş
      'shake',              // Sarsıntı eşiği aşıldı
      'speeding',           // Beklenmeyen hızlanma (GPS)
      'off_route'           // Güzergâh dışı (opsiyonel)
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Olayın gerçekleştiği konum — haritada işaretlemek için
  lat: { type: Number },
  lon: { type: Number },
  // Algoritmanın hangi değerle tetiklendiği — debugging ve raporlama için
  measuredValue: { type: Number },
  threshold: { type: Number },
  details: { type: String },  // İnsan okunabilir açıklama
  isRead: {
    type: Boolean,
    default: false           // dashboard'da "X yeni alarm" rozeti için
  }
}, {
  timestamps: true
});

// "X kullanıcının okunmamış son alarmları" sorgusu için index
alarmSchema.index({ userId: 1, isRead: 1, timestamp: -1 });

module.exports = mongoose.model('Alarm', alarmSchema);
