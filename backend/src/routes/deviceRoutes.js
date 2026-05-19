/**
 * /api/devices
 */

const router = require('express').Router();
const deviceController = require('../controllers/deviceController');
const authenticate = require('../middlewares/auth');

router.get('/', authenticate, deviceController.list);

module.exports = router;
