/**
 * ============================================================
 * Backend Giriş Noktası (Entry Point)
 * ============================================================
 *
 * Uygulamanın ayaklanma sırası:
 *   1) .env dosyasını yükle (dotenv)
 *   2) Express app'i kur (middleware'lar, routes, error handler)
 *   3) HTTP sunucusunu oluştur (Socket.io HTTP üzerinde yaşar, doğrudan
 *      app.listen yerine http.createServer kullanmamızın sebebi bu)
 *   4) Socket.io'yu bu sunucuya bağla
 *   5) MongoDB'ye bağlan
 *   6) PORT'u dinlemeye başla
 *
 * Bu dosyayı küçük tutmak önemli — gerçek mantık app.js, sockets/ ve
 * controllers/ içinde olmalı. server.js sadece "orchestration" yapar.
 * ============================================================
 */

// 1) .env dosyasındaki değişkenleri process.env'e yükle.
//    Bu satır mutlaka EN ÜSTTE olmalı, yoksa diğer modüller .env değerlerini
//    okuyamadan modül üst seviyede process.env.X aldığında undefined gelir.
require('dotenv').config();

const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./config/database');
const { initializeSocket } = require('./sockets');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Sunucuyu güvenli şekilde başlat.
 * Önce DB bağlantısı kurulmadan PORT'u dinlemeye başlasak,
 * gelen istekler 500 ile reddedilirdi. Bu yüzden sıra önemli.
 */
async function startServer() {
  try {
    // ÖNCE: MongoDB bağlantısı — başarısız olursa process.exit(1) yapar
    await connectDatabase();

    // SONRA: HTTP sunucu oluştur (Socket.io için gerekli)
    const httpServer = http.createServer(app);

    // Socket.io'yu HTTP sunucusuna ekle (gerçek zamanlı veri yayını için)
    initializeSocket(httpServer);

    // SON OLARAK: PORT'u dinle
    httpServer.listen(PORT, () => {
      logger.info(`Server calisiyor: http://localhost:${PORT}`);
      logger.info(`Swagger dokumantasyonu: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('Sunucu baslatma hatasi:', err);
    process.exit(1);
  }
}

// Yakalanmamış promise hataları için son savunma hattı
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

startServer();
