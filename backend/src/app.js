/**
 * ============================================================
 * Express Uygulamasını Yapılandırma
 * ============================================================
 *
 * server.js sadece sunucuyu başlatır; tüm Express konfigürasyonu burada.
 * Bu ayrım, integration testleri kolaylaştırır — testte Supertest'e
 * doğrudan `app`'i verip PORT açmadan istek atabiliriz.
 *
 * Middleware sırası ÖNEMLİDİR:
 *   1) CORS         — taraycı tarafında izinli origin
 *   2) JSON parser  — gelen body'yi parse et
 *   3) Logger       — request log
 *   4) Routes       — gerçek iş mantığı
 *   5) 404 handler  — eşleşmeyen rotalar
 *   6) Error handler — en son, hataları yakalar
 * ============================================================
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const tripRoutes = require('./routes/tripRoutes');
const alarmRoutes = require('./routes/alarmRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const errorHandler = require('./middlewares/errorHandler');
const swaggerSpec = require('./config/swagger');

const app = express();

// -- 1) CORS --
// Dashboard farklı port'tan istek atacak (Vite varsayılan 5173).
// Tarayıcı same-origin policy nedeniyle bunu engellerdi; CORS ile izin veriyoruz.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// -- 2) Body parser --
// JSON gövdeleri parse et. Limit verdik çünkü zaman damgalı sensör paketleri
// büyüyebilir (özellikle offline tampondan toplu gönderim).
app.use(express.json({ limit: '2mb' }));

// -- 3) HTTP request logger --
// morgan; her isteği konsola yazar. 'dev' formatı renkli ve kısa.
// Üretimde 'combined' formatına geçilebilir (Apache benzeri).
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// -- 4) Health check --
// Load balancer / monitoring araçlarının "ayakta mı?" sorusu için.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -- 5) Swagger UI --
// /api-docs adresinde interaktif API dokümantasyonu yayınla.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -- 6) API Rotaları --
// Her domain (auth, sensor, trip, alarm, user, device) ayrı router dosyasında.
// app.js sadece "hangi prefix hangi router'a gider"i bilir.
app.use('/api/auth', authRoutes);
app.use('/api/sensor-data', sensorRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);

// -- 7) 404 yakalayıcı --
// Eşleşmeyen tüm rotalar için
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.originalUrl} bulunamadi`
  });
});

// -- 8) Global hata yakalayıcı --
// MUTLAKA en sonda olmalı. 4 parametreli middleware'i Express otomatik olarak
// error handler kabul eder.
app.use(errorHandler);

module.exports = app;
