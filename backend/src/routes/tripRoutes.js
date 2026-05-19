/**
 * /api/trips
 */

const router = require('express').Router();
const { body, param } = require('express-validator');

const tripController = require('../controllers/tripController');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/trips/start:
 *   post:
 *     tags: [Trip]
 *     summary: Yeni sürüş başlat
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceUuid]
 *             properties:
 *               deviceUuid: { type: string }
 */
router.post(
  '/start',
  authenticate,
  body('deviceUuid').isString().notEmpty(),
  validate,
  tripController.start
);

/**
 * @openapi
 * /api/trips/{id}/end:
 *   post:
 *     tags: [Trip]
 *     summary: Sürüşü kapat, özet hesaplanır
 */
router.post(
  '/:id/end',
  authenticate,
  param('id').isMongoId(),
  validate,
  tripController.end
);

/**
 * @openapi
 * /api/trips:
 *   get:
 *     tags: [Trip]
 *     summary: Sürüş listesi
 */
router.get('/', authenticate, tripController.list);

/**
 * @openapi
 * /api/trips/{id}:
 *   get:
 *     tags: [Trip]
 *     summary: Sürüş detayı
 */
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId(),
  validate,
  tripController.detail
);

module.exports = router;
