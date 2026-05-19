/**
 * ============================================================
 * MongoDB Bağlantı Konfigürasyonu
 * ============================================================
 *
 * Bu modül, uygulama başlarken MongoDB'ye nasıl bağlanacağımızı
 * tek bir yerde toplar. Neden ayrı bir dosya?
 *
 *  1) Tek sorumluluk prensibi: server.js yalnızca yapılandırmayı
 *     başlatır; bağlantı detaylarını bilmek zorunda kalmaz.
 *
 *  2) Mongoose bağlantı olayları (connected / disconnected / error)
 *     burada loglanır. Üretimde sorun teşhisini kolaylaştırır.
 *
 *  3) Test ortamında farklı bir veritabanı bağlamak istersek
 *     yalnızca MONGODB_URI'yi değiştiriyoruz.
 * ============================================================
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB'ye bağlan.
 *
 * @returns {Promise<void>} Bağlantı kurulduğunda resolve olur.
 *
 * Hata durumunda process.exit(1) ile uygulamayı kapatıyoruz çünkü
 * DB olmadan API'nin ayakta kalmasının anlamı yok — request gelse bile
 * her şey 500 dönecektir. "Fail fast" yaklaşımı.
 */
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI tanımlı değil. .env dosyasını kontrol edin.');
    process.exit(1);
  }

  // Mongoose 7+ default olarak strictQuery=true. Eski kodlarda hata vermesin diye açık yazdık.
  mongoose.set('strictQuery', true);

  // Bağlantı olaylarını dinle — sorun tespiti için kritik
  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB baglantisi kuruldu: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB hatasi:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB baglantisi koptu.');
  });

  // Graceful shutdown: Ctrl+C veya kill geldiğinde bağlantıyı düzgün kapat
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB baglantisi temiz sekilde kapatildi.');
    process.exit(0);
  });

  try {
    await mongoose.connect(uri);
  } catch (err) {
    logger.error('MongoDB ilk baglanti basarisiz:', err);
    process.exit(1);
  }
}

module.exports = { connectDatabase };
