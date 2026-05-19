/**
 * ============================================================
 * Alarm Servisi
 * ============================================================
 *
 * Anomali tespit motoru bir anomali bulduğunda:
 *   1) DB'ye Alarm dokümanı yaz
 *   2) Trip'in alarmCount'unu artır
 *   3) Socket.io üzerinden ilgili kullanıcıya canlı yayın yap
 *
 * Controller'ı şişirmemek için bu üç adımı tek bir servis fonksiyonuna
 * topladık. Anomali geldiğinde tek satır: alarmService.create(...)
 * ============================================================
 */

const { Alarm, Trip } = require('../models');
const { getSocketIO } = require('../sockets');
const logger = require('../utils/logger');

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.tripId
 * @param {Object} params.anomaly - detector çıktısı { type, severity, ... }
 * @param {Object} params.sample - tetikleyen sensör örneği (lat/lon için)
 */
async function createAlarm({ userId, tripId, anomaly, sample }) {
  // 1) DB'ye yaz
  const alarm = await Alarm.create({
    userId,
    tripId,
    type: anomaly.type,
    severity: anomaly.severity,
    timestamp: sample.timestamp,
    lat: sample.lat,
    lon: sample.lon,
    measuredValue: anomaly.measuredValue,
    threshold: anomaly.threshold,
    details: anomaly.details
  });

  // 2) Trip sayacını artır (atomik $inc — race condition yok)
  await Trip.findByIdAndUpdate(tripId, { $inc: { alarmCount: 1 } });

  // 3) Socket.io ile canlı yayın
  // userId odasındaki tüm bağlı client'lara gönder (genelde sürücünün dashboard'u)
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit('alarm:new', alarm.toJSON());
    // Admin'lere de toplu yayın
    io.to('role:admin').emit('alarm:new', alarm.toJSON());
  }

  logger.info(`Alarm uretildi: ${anomaly.type} (${anomaly.severity}) user=${userId} trip=${tripId}`);

  return alarm;
}

module.exports = { createAlarm };
