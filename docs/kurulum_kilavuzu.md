# Kurulum ve Çalıştırma Kılavuzu

## Gereksinimler

| Yazılım | Sürüm | Nerede |
|---|---|---|
| Node.js | 18+ (24 önerilir) | nodejs.org |
| MongoDB | 5+ | mongodb.com — veya MongoDB Atlas (bulut) |
| Git | herhangi | git-scm.com |
| Expo CLI | npm üzerinden | otomatik gelir |
| Telefon | Android/iOS | Expo Go uygulaması kurulu olmalı |

## 1. Repo'yu Klonla

```bash
git clone https://github.com/<grup>/safe-drive-platform.git
cd safe-drive-platform
```

## 2. MongoDB'yi Çalıştır

Yerel kurulumda:
```bash
mongod  # varsayılan port 27017
```

Veya Docker ile:
```bash
docker run -d -p 27017:27017 --name safedrive-mongo mongo:7
```

MongoDB Atlas (bulut) kullanıyorsanız bağlantı URI'sini bir sonraki adımda kullanın.

## 3. Backend'i Kur ve Başlat

```bash
cd backend
npm install
cp .env.example .env
```

`.env` dosyasını düzenle:
```env
MONGODB_URI=mongodb://localhost:27017/safe_drive
JWT_SECRET=cok-gizli-bir-anahtar-en-az-32-karakter-uzun-olmali
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
BCRYPT_SALT_ROUNDS=10
```

Örnek veriyi yükle (önerilen):
```bash
npm run seed
```

Sunucuyu başlat:
```bash
npm run dev
```

Doğrulama:
- `http://localhost:5000/health` → `{ "status": "ok" }`
- `http://localhost:5000/api-docs` → Swagger UI

## 4. Dashboard'u Kur ve Başlat

Yeni bir terminal:
```bash
cd dashboard
npm install
npm run dev
```

Açılan adres: `http://localhost:5173`

Demo hesaplar (seed yüklediyseniz):
- Driver: `driver@example.com` / `driver123`
- Admin: `admin@example.com` / `admin123`

## 5. Mobile'ı Kur ve Çalıştır

Yeni bir terminal:
```bash
cd mobile
npm install
npx expo start
```

### Cihaz bağlantısı

**Android Emülator:** `app.json` → `extra.apiUrl: "http://10.0.2.2:5000"` (varsayılan zaten bu)

**iOS Simülator:** `app.json` → `extra.apiUrl: "http://localhost:5000"`

**Fiziksel telefon:**
1. Bilgisayarın LAN IP'sini bul:
   - Windows: `ipconfig` → IPv4 Address (ör. 192.168.1.10)
   - Mac/Linux: `ifconfig | grep inet`
2. `app.json` → `extra.apiUrl: "http://192.168.1.10:5000"` olarak değiştir
3. Telefon ve bilgisayar AYNI WiFi'de olmalı
4. Expo Go uygulamasını telefondan aç, terminaldeki QR kodu tara

## 6. Bağlantıyı Doğrula

1. Mobilde driver hesabıyla giriş yap.
2. "Sürüş Başlat" basınca:
   - Backend'te yeni Trip oluşur (log'ta görünür)
   - SensorService veri toplamaya başlar
3. Dashboard'da `/dashboard` sayfası canlı grafiği güncellemeye başlar.
4. Telefonu sallayın → "Sarsıntı" alarmı tetiklenir, dashboard'a toast düşer.

## Yaygın Sorunlar

### Backend MongoDB'ye bağlanamıyor
- MongoDB servisi çalışıyor mu? `mongod` veya `Get-Service MongoDB`
- URI doğru mu? Atlas'sa kullanıcı adı/parola eklendi mi?

### Dashboard "Network Error"
- Backend'in 5000 portunda çalıştığını kontrol et.
- Vite proxy `vite.config.js` içinde doğru target'ı gösteriyor mu?

### Mobile sensör verisi gelmiyor
- Konum izni verildi mi? Telefon ayarları → Uygulamalar → Safe Drive → İzinler
- Emülatorde GPS'i manuel ayarla (Android Studio Emulator Controls → Location)

### CORS hatası
- Backend `.env` içindeki `CORS_ORIGIN` Dashboard adresi mi? (`http://localhost:5173`)

### JWT "Invalid token"
- `JWT_SECRET` değiştiyse tüm token'lar geçersizleşir — kullanıcılar yeniden giriş yapmalı.

## Production'a Çıkış (Bonus)

### Docker ile (opsiyonel)
Her klasöre `Dockerfile` eklenir, root'a `docker-compose.yml`:
```yaml
services:
  mongo:
    image: mongo:7
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [mongo]
  dashboard:
    build: ./dashboard
    ports: ["80:80"]
```

### Mobile build (APK)
```bash
cd mobile
eas build --platform android
```

EAS hesabı gerekir (ücretsiz tier mevcut).
