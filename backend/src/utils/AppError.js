/**
 * Operational hatalar için özel Error sınıfı.
 *
 * Controller'da elimizle hata fırlatmak istediğimizde:
 *   throw new AppError(404, 'Trip bulunamadi');
 *
 * errorHandler bu sınıfı tanır ve statusCode + message'ı response'a yazar.
 *
 * Niye? `throw new Error('...')` fırlatınca her zaman 500 döner.
 * Spesifik status kodlarına ihtiyacımız var.
 */
class AppError extends Error {
  constructor(statusCode, message, errorName = 'Error') {
    super(message);
    this.statusCode = statusCode;
    this.error = errorName;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
