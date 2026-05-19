/**
 * ============================================================
 * JWT Doğrulama Middleware'i
 * ============================================================
 *
 * Korunan endpoint'lerden ÖNCE çalışır. İstek header'ında
 *   Authorization: Bearer <token>
 * şeklinde JWT bekler. Token geçerliyse:
 *   - req.user = { id, role, email } olarak set eder
 *   - next() ile devam eder
 * Geçersiz/eksik token gelirse 401 döner.
 *
 * Föy 5.3: "Yetkisiz kullanıcıların belirli kaynaklara erişimi
 * engellenmelidir" gereksinimi için bu middleware şart.
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1) Header eksikse veya 'Bearer ' ile başlamıyorsa erken çık
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token gonderilmedi. Authorization: Bearer <token> header eklemeniz gerekiyor.'
      });
    }

    // 2) Token'ı header'dan ayıkla
    const token = authHeader.substring(7); // 'Bearer '.length === 7

    // 3) JWT'yi doğrula. İmza yanlışsa / süresi geçtiyse hata fırlatır.
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // jsonwebtoken farklı hata türleri fırlatır:
      //   TokenExpiredError, JsonWebTokenError, NotBeforeError
      const message = err.name === 'TokenExpiredError'
        ? 'Oturum suresi doldu, lutfen tekrar giris yapin.'
        : 'Gecersiz token.';
      return res.status(401).json({ error: 'Unauthorized', message });
    }

    // 4) (Opsiyonel ama güvenli) Kullanıcı hâlâ DB'de var mı kontrol et.
    //    Çünkü silinmiş bir kullanıcının eski token'ı hâlâ geçerli olabilir.
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Kullanici artik mevcut degil.'
      });
    }

    // 5) Sonraki middleware'lerin kullanması için req nesnesine ekle
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (err) {
    // Beklenmeyen hata (DB down vs.) — error handler'a devret
    next(err);
  }
}

module.exports = authenticate;
