/**
 * ============================================================
 * Rol Bazlı Yetkilendirme Middleware'i
 * ============================================================
 *
 * authenticate'den SONRA çalışır. req.user.role'e bakarak izin verir/vermez.
 *
 * Kullanım:
 *   router.get('/users', authenticate, authorize('admin'), controller.list);
 *   router.get('/profile', authenticate, authorize('admin', 'driver'), controller.me);
 *
 * Birden çok rol kabul edebilsin diye rest parameters kullandık.
 *
 * Föy 5.3: "En az iki rol tanımlanmalıdır. Örnek: admin ve standart kullanıcı."
 * ============================================================
 */

function authorize(...allowedRoles) {
  return (req, res, next) => {
    // authenticate middleware bunu zaten doldurmuş olmalı. Defansif kontrol:
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Once kimlik dogrulamasi gerekiyor.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Bu islem icin gerekli rol: ${allowedRoles.join(' veya ')}. Sizin rolunuz: ${req.user.role}`
      });
    }

    next();
  };
}

module.exports = authorize;
