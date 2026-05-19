/**
 * Device Controller — Cihaz listesi.
 * Sürücü kendi cihazlarını, admin hepsini görür.
 */

const { Device } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const devices = await Device.find(filter)
      .sort({ lastSeenAt: -1 })
      .populate('userId', 'name email');
    res.json({ count: devices.length, devices });
  } catch (err) {
    next(err);
  }
};
