/**
 * /api/alarms
 */

const router = require('express').Router();
const { param } = require('express-validator');

const alarmController = require('../controllers/alarmController');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/alarms:
 *   get:
 *     tags: [Alarm]
 *     summary: Alarm listesi (filtreli)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: tripId, schema: { type: string } }
 *       - { in: query, name: severity, schema: { type: string, enum: [low, medium, high] } }
 */
router.get('/', authenticate, alarmController.list);

/**
 * @openapi
 * /api/alarms/{id}/read:
 *   patch:
 *     tags: [Alarm]
 *     summary: Alarmı okundu işaretle
 */
router.patch(
  '/:id/read',
  authenticate,
  param('id').isMongoId(),
  validate,
  alarmController.markRead
);

module.exports = router;
