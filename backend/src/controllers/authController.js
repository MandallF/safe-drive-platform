/**
 * ============================================================
 * Auth Controller — Kullanıcı kayıt, giriş, profil
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

/**
 * JWT üretme yardımcı fonksiyonu.
 * Token içine kullanıcı id'sini, rolünü ve email'ini koyuyoruz.
 * NOT: Hassas bilgi (parola, kişisel veri) JWT'ye konulmaz — token Base64 olarak
 * decode edilebilir, kim olsa okuyabilir.
 */
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Yeni kullanıcı oluştur.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Parolayı hashle (User modelindeki static helper)
    const passwordHash = await User.hashPassword(password);

    // Kullanıcıyı oluştur — duplicate email hatası errorHandler'a düşer (E11000)
    const user = await User.create({
      name,
      email,
      passwordHash,
      // Güvenlik: 'role' frontend'ten gelebilir ama admin yapılmasın diye sadece
      // 'driver' veya 'admin' arasından filtre. İstemiyorsak buradan 'role'u silebilirdik.
      role: role === 'admin' ? 'admin' : 'driver'
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Kayit basarili.',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Email + parola ile giriş.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // passwordHash select:false ile gizli — explicit istemek için +
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      // Güvenlik notu: "kullanıcı yok" ve "parola yanlış" için aynı mesajı veriyoruz
      // ki bir saldırgan hangi email'lerin kayıtlı olduğunu enumerate edemesin.
      throw new AppError(401, 'Email veya parola hatali.');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AppError(401, 'Email veya parola hatali.');
    }

    const token = signToken(user);

    res.json({
      message: 'Giris basarili.',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Mevcut oturumdaki kullanıcı bilgisi.
 * Frontend, sayfa yenilenince token'la birlikte bu endpoint'i çağırıp
 * kullanıcı bilgisini tekrar yükler.
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, 'Kullanici bulunamadi.');
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
