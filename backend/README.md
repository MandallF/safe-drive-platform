# Safe Drive Backend

Node.js + Express + MongoDB + Socket.io + JWT.

## Kurulum

```bash
npm install
cp .env.example .env       # Düzenle: MONGODB_URI, JWT_SECRET
npm run seed                # Örnek veri (sadece geliştirme)
npm run dev                 # http://localhost:5000
```

## Klasör Yapısı

```
src/
├── server.js              # Giriş noktası
├── app.js                 # Express konfigürasyonu
├── config/
│   ├── database.js        # MongoDB bağlantısı
│   └── swagger.js         # OpenAPI yapılandırma
├── models/                # Mongoose şemaları
├── controllers/           # İş mantığı
├── routes/                # API endpoint tanımları
├── middlewares/           # auth, authorize, validate, errorHandler
├── services/
│   ├── analysis/          # Anomali tespit (detektörler, smoothing, engine)
│   └── alarmService.js    # Alarm yaratma + Socket.io yayın
├── sockets/               # Socket.io kurulum
└── utils/                 # logger, AppError
```

## API Endpoints

| Method | Path | Yetki | Açıklama |
|---|---|---|---|
| POST | /api/auth/register | — | Kayıt |
| POST | /api/auth/login | — | Giriş |
| GET  | /api/auth/me | Token | Profil |
| POST | /api/sensor-data | Token | Sensör verisi ingest (tek/batch) |
| GET  | /api/sensor-data/trip/:tripId | Token | Sensör zaman serisi |
| POST | /api/trips/start | Token | Yeni sürüş |
| POST | /api/trips/:id/end | Token | Sürüşü kapat |
| GET  | /api/trips | Token | Sürüş listesi |
| GET  | /api/trips/:id | Token | Sürüş detay |
| GET  | /api/alarms | Token | Alarm listesi |
| PATCH | /api/alarms/:id/read | Token | Alarmı okundu yap |
| GET  | /api/users | Admin | Kullanıcı listesi |
| GET  | /api/devices | Token | Cihaz listesi |

Swagger UI: `http://localhost:5000/api-docs`

## Anomali Tespiti

`src/services/analysis/` altında 5 detektör:

| Detektör | Algoritma | Eşik (varsayılan) |
|---|---|---|
| Ani fren | accelY < eşik | −3.0 m/s² |
| Ani hızlanma | accelY > eşik | +3.0 m/s² |
| Sert dönüş | \|gyroZ\| > eşik | 0.5 rad/s |
| Sarsıntı | \|accel\| > eşik | 15 m/s² |
| Beklenmeyen hızlanma | Δspeed/Δt > eşik | 10 km/h/s |

Eşik değerlerini `src/services/analysis/thresholds.js` üzerinden ayarlayabilirsiniz.

## Test

```bash
npm test
```

## Socket.io

Bağlanma:
```js
const socket = io('http://localhost:5000', {
  auth: { token: '<JWT>' }
});
```

Olaylar:
- `sensor:data` — yeni sensör örneği (server -> client)
- `alarm:new` — yeni alarm (server -> client)
- `trip:subscribe` / `trip:unsubscribe` — trip odasına gir/çık (client -> server)
