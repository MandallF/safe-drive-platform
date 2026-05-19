/**
 * ============================================================
 * Logger (Winston)
 * ============================================================
 *
 * console.log yerine niye winston kullanıyoruz?
 *  - Log seviyeleri (info, warn, error, debug) ile filtreleme yapabiliriz.
 *  - Üretim ortamında dosyaya yazmak / harici bir log servisine
 *    göndermek tek satır config ile mümkün olur.
 *  - Timestamp ve format tutarlılığı sağlanır.
 *
 * Geliştirme modunda renklendirilmiş çıktı, üretimde JSON formatı kullanırız.
 * ============================================================
 */

const winston = require('winston');

const isDev = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info', // dev'de debug seviyesine kadar her şey, prod'da info'dan başlar
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // hata objesi gelirse stack trace de gelsin
    isDev
      ? winston.format.printf(({ timestamp, level, message, stack }) => {
          // Geliştirici dostu, okunaklı format
          return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
        })
      : winston.format.json() // üretimde JSON — Logstash / Splunk gibi araçlar parse eder
  ),
  transports: [
    // Şimdilik yalnızca konsola yazıyoruz.
    // Üretimde new winston.transports.File({ filename: 'app.log' }) eklenebilir.
    new winston.transports.Console()
  ]
});

module.exports = logger;
