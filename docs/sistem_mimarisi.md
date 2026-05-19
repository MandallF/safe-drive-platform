# Sistem Mimarisi

## Yüksek Seviye Diyagram

```
                            ┌────────────────────┐
                            │   Sürücünün        │
                            │   Telefonu (IoT)   │
                            │                    │
                            │  • Accelerometer   │
                            │  • Gyroscope       │
                            │  • GPS             │
                            └─────────┬──────────┘
                                      │
                       HTTP POST (saniyede 2 batch)
                                      │
                                      ▼
                            ┌────────────────────┐
                            │   Express Server    │
                            │     (Node.js)       │
                            │                     │
                            │  ┌───────────────┐  │
                            │  │ Middlewares   │  │
                            │  │ - CORS        │  │
                            │  │ - body parse  │  │
                            │  │ - JWT auth    │  │
                            │  │ - validation  │  │
                            │  └───────┬───────┘  │
                            │          ▼          │
                            │  ┌───────────────┐  │
                            │  │ Controllers   │  │
                            │  │ - auth        │  │
                            │  │ - sensor      │  │
                            │  │ - trip        │  │
                            │  │ - alarm       │  │
                            │  └───────┬───────┘  │
                            │          ▼          │
                            │  ┌───────────────┐  │
                            │  │ AnomalyEngine │  │
                            │  │ - detectors   │  │
                            │  │ - smoothing   │  │
                            │  │ - debounce    │  │
                            │  └───────┬───────┘  │
                            └──────────┼──────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
       ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
       │   MongoDB      │    │   Socket.io    │    │   Logger       │
       │                │    │   Yayın        │    │   (winston)    │
       │  • Users       │    │                │    │                │
       │  • Devices     │    │  ┌──────────┐  │    └────────────────┘
       │  • Trips       │    │  │ user:X   │  │
       │  • SensorData  │    │  │ role:admin│ │
       │  • Alarms      │    │  └────┬─────┘  │
       └────────────────┘    └───────┼────────┘
                                     │
                                     ▼
                            ┌────────────────────┐
                            │   Web Paneli       │
                            │   (React + Vite)   │
                            │                    │
                            │  • Dashboard       │
                            │  • Trips           │
                            │  • TripDetail+Map  │
                            │  • Alarms          │
                            │  • Admin pages     │
                            └────────────────────┘
```

## Veri Akışı — "Bir Ani Fren Olayı"

1. **t=0:** Sürücü ani fren yapar. Telefon ivmeölçeri Y ekseninde -4.5 m/s² ölçer.
2. **t=0:** Mobil SensorService 500 ms timer'ında bu değeri okur, buffer'a ekler.
3. **t=3s:** Batch timer çalışır → 6 sample'lık batch HTTP POST ile `/api/sensor-data`'ya gönderilir.
4. **Backend:** `sensorController.ingest()`:
   - JWT doğrulanır
   - Trip + Device kontrol edilir
   - SensorData.insertMany() ile tek sorguda 6 doküman yazılır
   - Her sample AnomalyEngine'den geçer:
     - MovingAverage ile yumuşatılır (gürültü filtrelenir)
     - detectHardBrake çağrılır → accelY < -3 olduğu için anomali döner
     - Debounce kontrol: son 3sn'de aynı tür alarm yoksa kabul edilir
   - `alarmService.createAlarm()`:
     - Alarm dokümanı oluşturulur
     - Trip.alarmCount $inc ile artırılır
     - `io.to('user:X').emit('alarm:new', alarm)` ile Socket.io yayını
5. **Dashboard:** AlarmToastContainer 'alarm:new' event'ini yakalar → ekranın sağ üstüne toast düşer.
6. **Dashboard:** Dashboard sayfasında live grafik bir sonraki sample emit'inde güncellenir.

Toplam gecikme: ~3-3.5 saniye (mobil batch interval + ağ).

## Güvenlik Katmanları

1. **Transport** — HTTPS (production'da Nginx/Let's Encrypt önerilir)
2. **Auth** — JWT (HS256 imza, 7 gün geçerlilik)
3. **Authorization** — Rol bazlı (admin / driver)
4. **Password** — bcrypt (saltRounds=10)
5. **Input validation** — express-validator + Mongoose schema
6. **Data isolation** — Sürücü sadece kendi tripleri/alarmları görür (controller'da userId filtresi)
7. **Sensitive field protection** — User.passwordHash `select: false` + `toJSON` siler
8. **Secrets** — `.env` dosyası + `.gitignore`

## Ölçeklenebilirlik Notları

- **Yatay ölçekleme:** Express stateless → birden çok instance çalışabilir. Socket.io scaling için `socket.io-redis-adapter` gerekir.
- **MongoDB:** SensorData hızlı büyür. Time Series Collection (v5+) veya hot/cold partitioning.
- **Caching:** Sıkça okunan trip özetleri için Redis cache layer eklenebilir.
- **Background jobs:** Aggregation hesapları Bull/BullMQ ile arka plana taşınabilir.
