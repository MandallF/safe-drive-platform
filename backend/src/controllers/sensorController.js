/**
 * ============================================================
 * Sensor Controller — Sensör verilerini al, analiz et, yayınla
 * ============================================================
 *
 * Bu controller'ın akışı:
 *   1) Mobil bir sample veya batch sample gönderir
 *   2) Cihazı doğrula / oluştur (upsert)
 *   3) SensorData'yı DB'ye yaz (bulk insert performans için)
 *   4) Her örneği AnomalyEngine'den geçir
 *   5) Tespit edilen anomaliler için Alarm oluştur
 *   6) Socket.io ile canlı veri yayını yap
 *
 * Performans notu: Sensör verisi YÜKSEK FREKANSLI gelir. Endpoint'i mümkün
 * olduğunca hızlı tutmak için:
 *   - bulk insertMany kullanıyoruz (tek transaction)
 *   - response'u DB yazımı bittikten sonra hemen dönüyoruz
 *   - Socket emit fire-and-forget (await yok)
 * ============================================================
 */

const { Device, Trip, SensorData } = require('../models');
const { getEngine } = require('../services/analysis/AnomalyEngine');
const { createAlarm } = require('../services/alarmService');
const { getSocketIO } = require('../sockets');
const AppError = require('../utils/AppError');

/**
 * POST /api/sensor-data
 * Tek bir sample veya { samples: [...] } batch kabul eder.
 */
exports.ingest = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Body normalize: hem tek sample hem batch desteklensin
    const samples = Array.isArray(req.body.samples)
      ? req.body.samples
      : [req.body];

    if (samples.length === 0) {
      throw new AppError(400, 'En az bir sensor ornegi gerekli.');
    }

    // Tüm samples aynı trip ve aynı device'a aitmiş varsayıyoruz
    const { tripId, deviceUuid } = samples[0];
    if (!tripId || !deviceUuid) {
      throw new AppError(400, 'tripId ve deviceUuid zorunlu.');
    }

    // Trip'i doğrula — bu kullanıcıya ait ve aktif mi?
    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) throw new AppError(404, 'Trip bulunamadi veya size ait degil.');
    if (trip.endedAt) throw new AppError(400, 'Bu trip kapatilmis, veri eklenemez.');

    // Device'ı upsert et — yoksa oluştur, varsa lastSeenAt güncelle
    const device = await Device.findOneAndUpdate(
      { deviceUuid },
      {
        $setOnInsert: { userId, deviceUuid },
        $set: { lastSeenAt: new Date() }
      },
      { upsert: true, new: true }
    );

    // Sample'ları DB için hazırla (timestamp string ise Date'e çevir)
    const docs = samples.map((s) => ({
      tripId: trip._id,
      deviceId: device._id,
      timestamp: new Date(s.timestamp),
      accelX: s.accelX,
      accelY: s.accelY,
      accelZ: s.accelZ,
      gyroX: s.gyroX || 0,
      gyroY: s.gyroY || 0,
      gyroZ: s.gyroZ || 0,
      lat: s.lat,
      lon: s.lon,
      speed: s.speed || 0
    }));

    // Bulk insert — tek round-trip, çok daha hızlı
    await SensorData.insertMany(docs, { ordered: false });

    // Anomali analizi — her örnek için motor çalıştır
    const engine = getEngine(trip._id);
    const detectedAlarms = [];
    for (const sample of docs) {
      const anomalies = engine.process(sample);
      for (const anomaly of anomalies) {
        const alarm = await createAlarm({
          userId,
          tripId: trip._id,
          anomaly,
          sample
        });
        detectedAlarms.push(alarm);
      }
    }

    // Canlı veri yayını — frontend dashboard zaman serisi grafiğine ekleyebilsin
    const io = getSocketIO();
    if (io) {
      // Son sample'ı (en güncel) gönder — saniyede 2 emit yetiyor
      const latest = docs[docs.length - 1];
      io.to(`user:${userId}`).emit('sensor:data', latest);
      io.to(`trip:${trip._id}`).emit('sensor:data', latest);
    }

    res.status(201).json({
      accepted: docs.length,
      alarmsTriggered: detectedAlarms.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/sensor-data/trip/:tripId?from=&to=
 * Bir trip'in sensör verilerini sıralı döndür.
 * Dashboard grafik için kullanır.
 */
exports.getByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { from, to, limit = 2000 } = req.query;

    // Trip'in sahibi mi? (admin değilse)
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError(404, 'Trip bulunamadi.');
    if (req.user.role !== 'admin' && trip.userId.toString() !== req.user.id) {
      throw new AppError(403, 'Bu trip size ait degil.');
    }

    const query = { tripId };
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const data = await SensorData.find(query)
      .sort({ timestamp: 1 })
      .limit(Math.min(parseInt(limit, 10), 10000)); // max 10k satır

    res.json({ count: data.length, data });
  } catch (err) {
    next(err);
  }
};
