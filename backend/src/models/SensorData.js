/**
 * ============================================================
 * SensorData (Sensör Verisi) Modeli
 * ============================================================
 *
 * En SIK yazılan, en KALABALIK koleksiyon. Telefon her 500ms'de
 * (saniyede 2 örnek) bir ivmeölçer + jiroskop + GPS okuyup buraya yazar.
 * 1 saatlik bir sürüş ≈ 7200 satır.
 *
 * Bu yüzden:
 *   1) Her dokuman MİNİMAL boyutta — sadece gerekli alanlar.
 *   2) tripId + timestamp üzerinde birleşik index var ki bir trip'in
 *      zaman serisi grafiğini çizerken sorgu hızlı olsun.
 *   3) Yazma yoğun olduğu için validation light tutuldu.
 *
 * BONUS: MongoDB time-series koleksiyonu (Mongo 5+) bu modele harika
 * uyar; produksiyona geçerken `timeseries` opsiyonu eklenebilir.
 * Şimdilik standart koleksiyon kullanıyoruz — daha taşınabilir.
 * ============================================================
 */

const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true               // zaman aralığı sorguları için
  },
  // İvmeölçer (m/s²)
  accelX: { type: Number, required: true },
  accelY: { type: Number, required: true },
  accelZ: { type: Number, required: true },
  // Jiroskop (rad/s) — opsiyonel; bazı eski telefonlarda jiroskop yok
  gyroX: { type: Number, default: 0 },
  gyroY: { type: Number, default: 0 },
  gyroZ: { type: Number, default: 0 },
  // GPS
  lat: { type: Number },
  lon: { type: Number },
  speed: { type: Number, default: 0 }  // km/h
}, {
  // timestamps DEĞİL — kendi 'timestamp' alanımızı kullanıyoruz çünkü o
  // telefonun ölçüm anını gösterir, sunucunun yazma anını değil.
  timestamps: false
});

// Birleşik index — "X trip'inin zaman serisini sırala" sorgusu için optimum
sensorDataSchema.index({ tripId: 1, timestamp: 1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
