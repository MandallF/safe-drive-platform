/**
 * ============================================================
 * Swagger / OpenAPI Yapılandırması
 * ============================================================
 *
 * swagger-jsdoc, route dosyalarındaki @openapi yorumlarını tarayarak
 * OpenAPI spesifikasyonunu üretir. swagger-ui-express bu spec'i tarayıcıda
 * interaktif bir dokümantasyon olarak sunar.
 *
 * /api-docs adresinde test edilebilir endpoint listesi gözükür — bu hem
 * frontend ekibine, hem de jüriye sistemi anlatmayı çok kolaylaştırır.
 *
 * Bonus puan: Föy "Swagger / OpenAPI entegrasyonu"nu açıkça bonus olarak listeliyor.
 * ============================================================
 */

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Güvenli Sürüş Platformu API',
      version: '1.0.0',
      description: 'Sürücü davranış analizi backend\'i. Sensör verisi alır, anomali tespit eder, alarm yayınlar.',
      contact: {
        name: 'Grup 4 — BTÜ Bilgisayar Mühendisliği'
      }
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Geliştirme' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // @openapi yorumlarını ararken bu glob pattern'ları kullan
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js')
  ]
};

module.exports = swaggerJsdoc(options);
