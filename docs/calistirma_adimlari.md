# Çalıştırma Adımları (Doğrulanmış)

> Bu doküman, projenin **gerçekten çalıştırılıp test edildiği** kurulumu anlatır.
> Tüm bileşenler lokalde doğrulandı (MongoDB + backend + dashboard + simülatör).

## Doğrulanan Durum ✅

| Bileşen | Test Sonucu |
|---|---|
| MongoDB (local, 27017) | Çalışıyor (Windows servisi, otomatik başlar) |
| Backend (5000) | `/health`, login+JWT, trips, alarms, sensor-data — hepsi OK |
| Anomali motoru | Ani fren / sert dönüş / hızlanma → alarm üretiyor |
| Jest testleri | 13/13 geçti |
| Dashboard (5173) | Login → dashboard (canlı grafik) → trips → alarms → harita render |
| Socket.io | Canlı sensör akışı + alarm toast bildirimi çalışıyor |
| Simülatör | Sahte sürüş → dashboard canlı güncelleniyor, alarmlar düşüyor |

## Önkoşullar (Kurulu)

- **Node.js** v24 ✅
- **MongoDB Community Server** 8.3 — `C:\Program Files\MongoDB\Server\8.3` ✅ (winget ile kuruldu, servis olarak çalışıyor)
- Bağımlılıklar: `backend`, `dashboard`, `mobile` klasörlerinde `npm install` yapıldı ✅

## Demo Hesapları

| Rol | Email | Parola |
|---|---|---|
| Sürücü | `driver@example.com` | `driver123` |
| Admin | `admin@example.com` | `admin123` |

---

## A) Bilgisayarda Demo (Telefon Gerekmez) — ÖNERİLEN

Üç terminal aç:

### Terminal 1 — Backend
```powershell
cd D:\Claude\safe-drive-platform\backend
npm run dev
```
→ `http://localhost:5000` · Swagger: `http://localhost:5000/api-docs`

> MongoDB servisi zaten çalışıyor. Durmuşsa: `net start MongoDB` (admin) veya
> `Get-Service MongoDB | Start-Service`.
> İlk kurulumda veya veriyi sıfırlamak için: `npm run seed`

### Terminal 2 — Dashboard
```powershell
cd D:\Claude\safe-drive-platform\dashboard
npm run dev
```
→ `http://localhost:5173` — tarayıcıda aç, `driver@example.com / driver123` ile gir.

### Terminal 3 — Sürüş Simülatörü
```powershell
cd D:\Claude\safe-drive-platform\backend
npm run simulate
```
→ Sahte bir sürüş başlatır. Dashboard'daki grafik **canlı akmaya** başlar,
ani fren/sert dönüşlerde sağ üstte **alarm toast'ı** düşer.
Durdurmak için `Ctrl+C` (sürüşü düzgünce kapatır).

**Demo akışı:** Dashboard'ı aç → simülatörü başlat → grafiğin canlandığını ve
alarmların düştüğünü göster → Sürüşler ve Alarmlar sayfalarını gez.

---

## B) iPhone ile Gerçek Sürüş Demosu

### 1. Firewall — port 5000 ve 8081'i aç (TEK SEFER, admin gerekir)
**Yönetici** PowerShell aç (Başlat → "PowerShell" → sağ tık → Yönetici olarak çalıştır) ve iki komutu da çalıştır:
```powershell
netsh advfirewall firewall add rule name="SafeDrive 5000" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="SafeDrive Expo 8081" dir=in action=allow protocol=TCP localport=8081
```
> 5000 = backend, 8081 = Expo Metro (uygulama paketini telefona gönderir).
> Bunlar olmadan iPhone bağlanamaz; "Network Error" görürsen sebep budur.

> **Not:** Mobil uygulama **Expo SDK 56** (React Native 0.85) ile günceldir; iPhone'daki **Expo Go**'nun App Store'dan güncel sürümü olmalı.

### 2. Aynı WiFi
iPhone ve bilgisayar **aynı ağda** olmalı. Bilgisayarın IP'si: **`192.168.1.116`**
(`mobile/app.json` içine bu yazıldı: `extra.apiUrl: http://192.168.1.116:5000`).

> IP değişirse `ipconfig` ile yeni IPv4'ü öğren, `app.json`'daki apiUrl'i güncelle.

### 3. Backend'i çalıştır (Terminal 1 — yukarıdaki gibi)

### 4. iPhone'da Expo Go
1. App Store'dan **Expo Go** kur.
2. Terminal aç:
   ```powershell
   cd D:\Claude\safe-drive-platform\mobile
   npx expo start
   ```
3. Çıkan QR kodu iPhone **kamerasıyla** tara → Expo Go açılır.
4. `driver@example.com / driver123` ile giriş yap.
5. **"Sürüş Başlat"** → telefonu hareket ettir/salla → dashboard'da canlı veri + alarmlar.

---

## Sorun Giderme

| Belirti | Çözüm |
|---|---|
| Backend "Mongo bağlantı hatası" | MongoDB servisi çalışıyor mu? `Get-Service MongoDB` |
| Dashboard "Network Error" | Backend 5000'de çalışıyor mu? |
| Dashboard boş/login dönüyor | Token süresi dolmuş olabilir, tekrar giriş yap |
| iPhone backend'e ulaşamıyor | Firewall kuralı (B.1) + aynı WiFi + doğru IP |
| Alarm düşmüyor | Simülatör çalışıyor mu? Gerçek sürüşte sert hareket gerekir |
| Port 5000/5173 dolu | `Get-NetTCPConnection -LocalPort 5000` ile PID bul, kapat |

## Notlar

- `.env` dosyası `backend/` içinde, **git'e gönderilmez** (JWT secret içerir).
- Veriyi sıfırlamak: `cd backend && npm run seed` (mevcut veriyi siler, demo verisini yükler).
- Eşik değerleri: `backend/src/services/analysis/thresholds.js` (gerçek araç testiyle ayarlanabilir).
