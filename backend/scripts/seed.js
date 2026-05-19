/**
 * ============================================================
 * Seed Scripti — Örnek Veri Yükleyici
 * ============================================================
 *
 * Geliştirme ve demo için temiz, tutarlı bir başlangıç verisi yükler:
 *   - 1 admin kullanıcı (admin@example.com / admin123)
 *   - 1 driver kullanıcı (driver@example.com / driver123)
 *   - 1 cihaz
 *   - 1 örnek trip (bitmiş)
 *   - Yaklaşık 300 sensör örneği (5 dakikalık simüle edilmiş sürüş)
 *   - Trip içinde 1-2 anomali (ani fren senaryosu)
 *
 * Çalıştırma:
 *   npm run seed
 *
 * UYARI: Mevcut verileri SİLER — sadece geliştirme ortamında çalıştırın.
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');
const { User, Device, Trip, SensorData, Alarm } = require('../src/models');
const logger = require('../src/utils/logger');

async function seed() {
  await connectDatabase();
  logger.info('Seed basliyor — mevcut veri temizleniyor...');

  // Tüm koleksiyonları temizle
  await Promise.all([
    User.deleteMany({}),
    Device.deleteMany({}),
    Trip.deleteMany({}),
    SensorData.deleteMany({}),
    Alarm.deleteMany({})
  ]);

  // -- Kullanıcılar --
  const adminPwd = await User.hashPassword('admin123');
  const driverPwd = await User.hashPassword('driver123');

  const admin = await User.create({
    name: 'Admin Yonetici',
    email: 'admin@example.com',
    passwordHash: adminPwd,
    role: 'admin'
  });

  const driver = await User.create({
    name: 'Ornek Surucu',
    email: 'driver@example.com',
    passwordHash: driverPwd,
    role: 'driver'
  });

  logger.info(`Kullanicilar olusturuldu: admin=${admin._id}, driver=${driver._id}`);

  // -- Cihaz --
  const device = await Device.create({
    userId: driver._id,
    deviceUuid: 'demo-device-uuid-0001',
    model: 'Demo Phone',
    os: 'android'
  });

  // -- Trip (bitmiş) --
  const tripStart = new Date(Date.now() - 30 * 60 * 1000); // 30 dk önce başladı
  const tripEnd = new Date(Date.now() - 25 * 60 * 1000);   // 25 dk önce bitti (5 dk sürdü)

  const trip = await Trip.create({
    userId: driver._id,
    deviceId: device._id,
    startedAt: tripStart,
    endedAt: tripEnd
  });

  // -- Sensor data — 5 dakika boyunca her 2 saniyede 1 örnek = 150 örnek --
  const samples = [];
  const SAMPLE_COUNT = 150;
  const DURATION_MS = 5 * 60 * 1000;

  // Bursa civarı GPS rotası — düz çizgide kuzeye doğru hareket
  const baseLat = 40.197;
  const baseLon = 29.060;

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const t = new Date(tripStart.getTime() + (i / SAMPLE_COUNT) * DURATION_MS);
    const progress = i / SAMPLE_COUNT;

    // Normal sürüş: hafif gürültü etrafında
    let accelY = (Math.random() - 0.5) * 1.5; // -0.75 .. +0.75
    const accelX = (Math.random() - 0.5) * 0.5;
    const accelZ = 9.8 + (Math.random() - 0.5) * 0.3; // yerçekimi + gürültü
    const gyroZ = (Math.random() - 0.5) * 0.2;
    const speed = 30 + Math.sin(progress * Math.PI * 2) * 15 + (Math.random() - 0.5) * 3;

    // İLGİNÇ MOMENTLER — anomali tetikleyecek senaryolar
    // i=50'de ani fren (-4.5 m/s²)
    if (i === 50) {
      accelY = -4.5;
    }
    // i=90'da ani hızlanma (+3.5 m/s²)
    if (i === 90) {
      accelY = 3.5;
    }

    samples.push({
      tripId: trip._id,
      deviceId: device._id,
      timestamp: t,
      accelX,
      accelY,
      accelZ,
      gyroX: 0,
      gyroY: 0,
      gyroZ,
      lat: baseLat + progress * 0.01,
      lon: baseLon + progress * 0.005,
      speed: Math.max(0, speed)
    });
  }

  await SensorData.insertMany(samples);
  logger.info(`${samples.length} sensor ornegi yazildi.`);

  // -- Önceden hesaplanmış alarmlar (anomali analizinden simüle) --
  const alarms = await Alarm.insertMany([
    {
      userId: driver._id,
      tripId: trip._id,
      type: 'hard_brake',
      severity: 'medium',
      timestamp: samples[50].timestamp,
      lat: samples[50].lat,
      lon: samples[50].lon,
      measuredValue: -4.5,
      threshold: -3.0,
      details: 'Ani fren tespit edildi: -4.50 m/s²'
    },
    {
      userId: driver._id,
      tripId: trip._id,
      type: 'rapid_acceleration',
      severity: 'low',
      timestamp: samples[90].timestamp,
      lat: samples[90].lat,
      lon: samples[90].lon,
      measuredValue: 3.5,
      threshold: 3.0,
      details: 'Ani hizlanma: 3.50 m/s²'
    }
  ]);

  // Trip özet bilgilerini güncelle
  await Trip.findByIdAndUpdate(trip._id, {
    avgSpeedKmh: 30,
    maxSpeedKmh: 45,
    distanceMeters: 2500,
    alarmCount: alarms.length,
    riskScore: 28
  });

  logger.info('Seed tamamlandi!');
  logger.info('Giris bilgileri:');
  logger.info('  ADMIN  -> admin@example.com / admin123');
  logger.info('  DRIVER -> driver@example.com / driver123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seed hatasi:', err);
  process.exit(1);
});
