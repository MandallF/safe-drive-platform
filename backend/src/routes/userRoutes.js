/**
 * /api/users — admin yetkisi gerekir
 */

const router = require('express').Router();
const { param } = require('express-validator');

const userController = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');

// Tüm endpoint'ler önce kimlik doğrula, sonra admin rolü zorunlu
router.use(authenticate, authorize('admin'));

router.get('/', userController.list);
router.get('/:id', param('id').isMongoId(), validate, userController.detail);
router.delete('/:id', param('id').isMongoId(), validate, userController.remove);

module.exports = router;
