/**
 * ============================================================
 * /api/auth — kayıt, giriş, profil
 * ============================================================
 */

const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Yeni kullanıcı kayıt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Kubilay Inanc" }
 *               email: { type: string, example: "kubilay@example.com" }
 *               password: { type: string, example: "guclu-parola" }
 *               role: { type: string, enum: [driver, admin], default: driver }
 *     responses:
 *       201: { description: Kayıt başarılı (token döner) }
 *       409: { description: Email zaten kayıtlı }
 */
router.post(
  '/register',
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Parola en az 6 karakter olmali'),
  body('role').optional().isIn(['driver', 'admin']),
  validate,
  authController.register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Giriş
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Giriş başarılı (token döner) }
 *       401: { description: Email/parola yanlış }
 */
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  validate,
  authController.login
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Oturumdaki kullanıcı bilgisi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Kullanıcı bilgisi }
 *       401: { description: Token geçersiz }
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
