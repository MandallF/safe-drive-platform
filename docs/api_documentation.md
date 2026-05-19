# API Dokümantasyonu

Tüm endpoint'lerin interaktif sürümü Swagger UI'da:
**`http://localhost:5000/api-docs`**

Aşağıda bir özet bulunmaktadır. Detaylı request/response şemaları Swagger'da.

## Auth

### POST /api/auth/register
Yeni kullanıcı oluştur.

**Body:**
```json
{
  "name": "Kubilay Inanc",
  "email": "kubilay@example.com",
  "password": "guclu-parola",
  "role": "driver"
}
```

**Response 201:**
```json
{
  "message": "Kayit basarili.",
  "token": "eyJhbGc...",
  "user": { "_id": "...", "name": "...", "email": "...", "role": "driver" }
}
```

### POST /api/auth/login
**Body:** `{ "email": "...", "password": "..." }`
**Response 200:** token + user

### GET /api/auth/me
Header: `Authorization: Bearer <token>`
Mevcut oturumdaki kullanıcı.

---

## Sensor Data

### POST /api/sensor-data
Mobilden veri al. Tek sample veya batch.

**Tek sample body:**
```json
{
  "tripId": "65f...",
  "deviceUuid": "android-id-12345",
  "timestamp": "2025-05-19T10:00:00Z",
  "accelX": 0.1, "accelY": -3.5, "accelZ": 9.8,
  "gyroX": 0, "gyroY": 0, "gyroZ": 0.2,
  "lat": 40.197, "lon": 29.060, "speed": 50
}
```

**Batch body:**
```json
{
  "samples": [ {...}, {...}, ... ]
}
```

**Response 201:**
```json
{ "accepted": 6, "alarmsTriggered": 1 }
```

### GET /api/sensor-data/trip/:tripId
Bir trip'in tüm sensör verisini sırayla döner.

**Query:** `from`, `to`, `limit` (max 10000)

---

## Trips

### POST /api/trips/start
**Body:** `{ "deviceUuid": "..." }`
Yeni sürüş başlatır.

### POST /api/trips/:id/end
Sürüşü kapat, özet alanları hesaplanır.

### GET /api/trips
Kullanıcının (veya admin'se herkesin) sürüş listesi.
**Query:** `page`, `limit`

### GET /api/trips/:id
Tek trip detayı.

---

## Alarms

### GET /api/alarms
**Query:** `tripId`, `severity` (low/medium/high), `from`, `to`, `page`, `limit`

### PATCH /api/alarms/:id/read
Alarmı okundu işaretle.

---

## Users (Admin)

Tüm endpoint'ler: `Authorization: Bearer <admin-token>`

- GET /api/users — liste
- GET /api/users/:id — detay
- DELETE /api/users/:id — sil

---

## Devices

### GET /api/devices
Kullanıcının (veya admin'se tüm) cihazları.

---

## Socket.io

### Bağlanma
```js
const socket = io('http://localhost:5000', { auth: { token: '<JWT>' } });
```

### Olaylar (server → client)
- `sensor:data` — yeni sensör örneği (yalnızca kullanıcının odasına)
- `alarm:new` — yeni alarm

### Olaylar (client → server)
- `trip:subscribe` — belirli bir trip'i izlemek için
- `trip:unsubscribe` — odadan çıkmak için

### Odalar
- `user:<userId>` — kullanıcının kendi yayını
- `role:admin` — tüm admin'lerin ortak odası
- `trip:<tripId>` — belirli trip izleyicileri

---

## Hata Yanıtları

| HTTP | Tetikleyen |
|---|---|
| 400 | Validation hatası, eksik field |
| 401 | Token eksik/geçersiz/süresi dolmuş |
| 403 | Yetkisiz erişim (rol uyuşmazlığı) |
| 404 | Kaynak bulunamadı |
| 409 | Conflict (örn. duplicate email) |
| 500 | Sunucu hatası |

**Standart hata gövdesi:**
```json
{
  "error": "Unauthorized",
  "message": "Oturum suresi doldu, lutfen tekrar giris yapin."
}
```

**Validation hatası (400):**
```json
{
  "error": "Validation Error",
  "message": "Gonderilen veri gecersiz.",
  "errors": [
    { "field": "email", "message": "Gecersiz email", "value": "..." }
  ]
}
```
