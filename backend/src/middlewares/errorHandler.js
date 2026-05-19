/**
 * ============================================================
 * Global Hata Yakalama Middleware'i
 * ============================================================
 *
 * Express, 4 parametreli middleware'i (err, req, res, next) otomatik
 * olarak "error handler" kabul eder. Yakalanmamış tüm hatalar buraya düşer.
 *
 * Burada amacımız:
 *   1) Hatayı LOGLAMAK (winston ile, stack trace dahil)
 *   2) İstemciye anlamlı bir status code + JSON döndürmek
 *   3) Üretim modunda sensitive bilgi (stack trace) sızdırmamak
 *
 * Mongoose hatalarını yakalayıp daha açıklayıcı mesaja çeviriyoruz —
 * frontend "E11000 duplicate key" yerine "Bu email zaten kayitli." görsün.
 * ============================================================
 */

const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // 1) Logla — özellikle production'da, bu satır olmazsa hatalar kaybolur
  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`, { stack: err.stack });

  // 2) Mongoose duplicate key hatası — örn. unique email çakışması
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'alan';
    return res.status(409).json({
      error: 'Conflict',
      message: `Bu ${field} zaten kayitli.`
    });
  }

  // 3) Mongoose ValidationError — schema validator hatası
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Veri dogrulama hatasi.',
      errors
    });
  }

  // 4) Mongoose CastError — örn. geçersiz ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Gecersiz ${err.path}: ${err.value}`
    });
  }

  // 5) Bilinen status'lu hata (controller'larda elimizle attığımız)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.error || 'Error',
      message: err.message
    });
  }

  // 6) Beklenmeyen hata
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDev ? err.message : 'Beklenmeyen bir hata olustu.',
    ...(isDev && { stack: err.stack })  // sadece dev'de stack göster
  });
}

module.exports = errorHandler;
