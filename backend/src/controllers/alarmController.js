/**
 * ============================================================
 * Alarm Controller
 * ============================================================
 */

const { Alarm } = require('../models');
const AppError = require('../utils/AppError');

/**
 * GET /api/alarms?tripId=&severity=&from=&to=
 * Kullanıcının alarmlarını filtrelenmiş şekilde döner.
 */
exports.list = async (req, res, next) => {
  try {
    const { tripId, severity, from, to, page = 1, limit = 50 } = req.query;
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };

    if (tripId) filter.tripId = tripId;
    if (severity) filter.severity = severity;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;
    const [alarms, total] = await Promise.all([
      Alarm.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('userId', 'name email'),
      Alarm.countDocuments(filter)
    ]);

    res.json({ total, page: parseInt(page, 10), alarms });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/alarms/:id/read
 * Alarmı okundu olarak işaretle.
 */
exports.markRead = async (req, res, next) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) throw new AppError(404, 'Alarm bulunamadi.');
    if (req.user.role !== 'admin' && alarm.userId.toString() !== req.user.id) {
      throw new AppError(403, 'Bu alarm size ait degil.');
    }
    alarm.isRead = true;
    await alarm.save();
    res.json({ alarm });
  } catch (err) {
    next(err);
  }
};
