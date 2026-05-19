/**
 * ============================================================
 * /api/sensor-data — Sensör verisi giriş + sorgu
 * ============================================================
 */

const router = require('express').Router();
const { body, param } = require('express-validator');

const sensorController = require('../controllers/sensorController');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/sensor-data:
 *   post:
 *     tags: [Sensor]
 *     summary: Mobilden gelen sensör örneğini/örneklerini al
 *     description: Tek sample veya { samples: [...] } batch destekler.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Veri kabul edildi; tetiklenen alarm sayısı döner }
 */
router.post(
  '/',
  authenticate,
  // Hem tek sample hem batch için esnek validation — controller içinde detaylı kontrol var
  body().custom((value) => {
    if (Array.isArray(value.samples)) return true;
    if (typeof value.accelX === 'number' && typeof value.accelY === 'number') return true;
    throw new Error('Gecersiz veri formati. { tripId, accelX, ... } veya { samples: [...] } bekleniyor.');
  }),
  validate,
  sensorController.ingest
);

/**
 * @openapi
 * /api/sensor-data/trip/{tripId}:
 *   get:
 *     tags: [Sensor]
 *     summary: Bir trip'in sensör zaman serisi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Sensör veri listesi }
 */
router.get(
  '/trip/:tripId',
  authenticate,
  param('tripId').isMongoId(),
  validate,
  sensorController.getByTrip
);

module.exports = router;
