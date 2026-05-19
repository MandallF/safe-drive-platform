/**
 * ============================================================
 * User Modeli
 * ============================================================
 *
 * Sistemdeki kullanıcıları temsil eder. Föy 5.3 gereği EN AZ İKİ rol
 * tanımlamamız gerekiyor:
 *   - 'admin'  : Tüm kullanıcıları ve cihazları yönetir, alarmları görür.
 *   - 'driver' : Sadece kendi sürüş kayıtlarına erişir.
 *
 * Güvenlik notları:
 *   - Parolayı bcrypt ile hashleyip 'passwordHash' alanında saklıyoruz.
 *     Düz parola asla DB'ye yazılmaz, log'a yazılmaz, response'a koyulmaz.
 *   - toJSON metodunda passwordHash'i siliyoruz; API response'unda
 *     yanlışlıkla sızmasın diye.
 * ============================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad zorunlu'],
    trim: true,
    minlength: 2,
    maxlength: 80
  },
  email: {
    type: String,
    required: [true, 'Email zorunlu'],
    unique: true,             // aynı email ile iki kullanıcı olamaz
    lowercase: true,          // 'KULLANICI@x.com' ile 'kullanici@x.com' aynı kabul edilsin
    trim: true,
    // Basit email regex'i — production'da daha sıkı validator (email-validator paketi) önerilir
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Gecersiz email formati']
  },
  passwordHash: {
    type: String,
    required: true,
    select: false             // varsayılan sorgularda gelmesin (User.find() çağrılarında)
                              // explicit istemek için: User.findById(id).select('+passwordHash')
  },
  role: {
    type: String,
    enum: ['admin', 'driver'], // sadece bu iki değer kabul edilir
    default: 'driver'
  }
}, {
  timestamps: true            // createdAt + updatedAt alanlarını otomatik ekler
});

/**
 * Parola hashleme yardımcı static fonksiyon.
 * Controller'da bunu çağırarak düz parola yerine hash'i kaydederiz.
 *
 * @param {string} plainPassword - Kullanıcının girdiği düz parola
 * @returns {Promise<string>} bcrypt hash
 */
userSchema.statics.hashPassword = async function (plainPassword) {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  return bcrypt.hash(plainPassword, rounds);
};

/**
 * Parola karşılaştırma instance metodu.
 * Login sırasında çağrılır.
 *
 * @param {string} candidatePassword - Login formundan gelen düz parola
 * @returns {Promise<boolean>} true: doğru, false: yanlış
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * JSON'a çevrilirken hassas alanları çıkar.
 * Bu sayede res.json(user) çağrısı passwordHash'i sızdırmaz.
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;          // mongoose'un versiyon alanı — istemciye gerek yok
  return obj;
};

module.exports = mongoose.model('User', userSchema);
