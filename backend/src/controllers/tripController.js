/**
 * ============================================================
 * Trip Controller — Sürüş oturumlarını yönet
 * ============================================================
 *
 * Akış:
 *   POST   /api/trips/start  -> Yeni trip aç, _id döndür (mobile bunu cache'ler)
 *   POST   /api/trips/:id/end -> Trip'i kapat, özet hesapla
 *   GET    /api/trips         -> Kullanıcının tüm trip listesi
 *   GET    /api/trips/:id     -> Tek bir trip detayı
 * ============================================================
 */

const { Trip, Device, SensorData, Alarm } = require('../models');
const { AnomalyEngine, destroyEngine } = require('../services/analysis/AnomalyEngine');
const AppError = require('../utils/AppError');

/**
 * POST /api/trips/start
 * body: { deviceUuid }
 */
exports.start = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deviceUuid } = req.body;
    if (!deviceUuid) throw new AppError(400, 'deviceUuid zorunlu.');

    // Cihazı upsert
    const device = await Device.findOneAndUpdate(
      { deviceUuid },
      { $setOnInsert: { userId, deviceUuid }, $set: { lastSeenAt: new Date() } },
      { upsert: true, new: true }
    );

    // Aynı kullanıcının açık bir trip'i var mı? Olmasın (kullanıcı yanlışlıkla iki kez başlatmış olabilir)
    const existing = await Trip.findOne({ userId, endedAt: null });
    if (existing) {
      // Var olan'ı dön — mobile bunu kullansın, yeni eklemeyelim
      return res.json({ message: 'Aktif trip mevcut, devam ediliyor.', trip: existing });
    }

    const trip = await Trip.create({
      userId,
      deviceId: device._id,
      startedAt: new Date()
    });

    res.status(201).json({ message: 'Trip baslatildi.', trip });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trips/:id/end
 * Trip'i kapat ve özet alanları hesapla.
 */
exports.end = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) throw new AppError(404, 'Trip bulunamadi.');
    if (trip.endedAt) throw new AppError(400, 'Trip zaten kapali.');

    const endedAt = new Date();
    const durationMinutes = (endedAt - trip.startedAt) / 60000;

    // Aggregation: hız + mesafe + maks hız hesapla
    const stats = await SensorData.aggregate([
      { $match: { tripId: trip._id } },
      { $group: {
          _id: null,
          avgSpeed: { $avg: '$speed' },
          maxSpeed: { $max: '$speed' },
          count: { $sum: 1 }
      } }
    ]);
    const aggregate = stats[0] || { avgSpeed: 0, maxSpeed: 0, count: 0 };

    // Kabaca mesafe = ortalama hız × süre (km/saat × saat).
    // Daha doğru yöntem ardışık GPS noktalarının haversine mesafelerini toplamak
    // ama o O(N) ek hesap. Demo için bu yaklaşım yeterli.
    const distanceMeters = (aggregate.avgSpeed / 3.6) * (durationMinutes * 60);

    // Alarmları çek — risk skoru için
    const alarms = await Alarm.find({ tripId: trip._id }, 'severity');
    const riskScore = AnomalyEngine.calculateRiskScore(alarms, durationMinutes);

    // Trip'i güncelle
    trip.endedAt = endedAt;
    trip.avgSpeedKmh = Math.round((aggregate.avgSpeed || 0) * 100) / 100;
    trip.maxSpeedKmh = Math.round((aggregate.maxSpeed || 0) * 100) / 100;
    trip.distanceMeters = Math.round(distanceMeters);
    trip.alarmCount = alarms.length;
    trip.riskScore = riskScore;
    await trip.save();

    // Engine cache'ini temizle — bellek sızıntısı olmasın
    destroyEngine(trip._id);

    res.json({ message: 'Trip kapatildi.', trip });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips
 * Kullanıcının trip listesi. Admin tüm trip'leri görür.
 */
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('userId', 'name email'), // admin'in user adını görmesi için
      Trip.countDocuments(filter)
    ]);

    res.json({ total, page: parseInt(page, 10), trips });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips/:id
 * Tek trip detay
 */
exports.detail = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('userId', 'name email');
    if (!trip) throw new AppError(404, 'Trip bulunamadi.');

    // Sahiplik kontrolü
    if (req.user.role !== 'admin' && trip.userId._id.toString() !== req.user.id) {
      throw new AppError(403, 'Bu trip size ait degil.');
    }

    res.json({ trip });
  } catch (err) {
    next(err);
  }
};
