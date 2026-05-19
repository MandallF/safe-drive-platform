/**
 * ============================================================
 * express-validator Sonuç Toplama Middleware'i
 * ============================================================
 *
 * express-validator'ın check() / body() / param() fonksiyonları validator
 * "tanımları" oluşturur — bunlar tek başına bir şey yapmaz. Onları çalıştıran
 * ve sonuçları toplayan bu middleware'dir.
 *
 * Kullanım:
 *   router.post('/login',
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 }),
 *     validate,                  // <-- sonuçları kontrol eder
 *     authController.login
 *   );
 *
 * Hata varsa 400 döner ve hangi alanların hatalı olduğunu listeler.
 * ============================================================
 */

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  // result.array() => [ { msg, param, value, location } ]
  // Frontend için temiz bir yapıya dönüştürüyoruz.
  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
    value: err.value
  }));

  return res.status(400).json({
    error: 'Validation Error',
    message: 'Gonderilen veri gecersiz.',
    errors
  });
}

module.exports = validate;
