/**
 * ============================================================
 * User Controller — Sadece Admin
 * ============================================================
 *
 * Föy 5.3 "yetkisiz kullanıcı erişimi engellenmeli" kuralı gereği
 * bu endpoint'ler authorize('admin') ile korunur.
 * ============================================================
 */

const { User } = require('../models');
const AppError = require('../utils/AppError');

exports.list = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError(404, 'Kullanici bulunamadi.');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError(404, 'Kullanici bulunamadi.');
    res.json({ message: 'Kullanici silindi.', user });
  } catch (err) {
    next(err);
  }
};
