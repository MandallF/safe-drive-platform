# Güvenli Sürüş ve Sürücü Davranışı Analizi Platformu

> Bursa Teknik Üniversitesi — Bilgisayar Mühendisliği  
> Node.js ile Web Programlama Dersi — Dönem Projesi  
> Senaryo 1: Mobil Güvenlik ve Davranış Analizi Platformu

## Proje Özeti

Akıllı telefonun araç içerisinde bir IoT düğümü gibi kullanıldığı; ivmeölçer, jiroskop ve GPS verilerini Node.js backend'ine gerçek zamanlı olarak ileten; ani fren, sert dönüş, ani hızlanma gibi olağandışı sürüş davranışlarını eşik tabanlı bir analiz modülüyle tespit edip web paneli üzerinden raporlayan tam yığın (full-stack) bir platformdur.

Sistem; Jest birim testleri (13/13) ve **gerçek bir iOS cihazı** üzerinde yapılan uçtan uca testlerle doğrulanmıştır.

## Grup Üyeleri

| Numara | Ad Soyad |
|---|---|
| 23360859019 | Melike Rana Yozgatlı |
| 23360859034 | Selen Yakın |
| 23360859739 | Talha Korkmaz |
| 22360859047 | Kubilay İnanç |

## Proje Yapısı (Monorepo)

```
safe-drive-platform/
├── backend/     # Node.js + Express + MongoDB + Socket.io + anomali motoru
├── mobile/      # React Native (Expo, SDK 54) — sürücünün telefonu
├── dashboard/   # React + Vite + Chart.js + Leaflet (web paneli)
├── docs/        # Teknik dokümanlar (rapor kaynağı, API, kurulum, mimari, veri modeli)
└── sunum/       # Teslim dosyaları: proje raporu (.docx) + sunum (.pptx)
```

## Önkoşullar

- **Node.js** 18+ (geliştirme 24 ile yapıldı)
- **MongoDB** (yerel servis veya MongoDB Atlas) — backend için gerekli
- **Mobil için:** App Store / Play Store'dan **Expo Go** uygulaması

## Hızlı Başlangıç

> 🆕 **Sıfırdan yeni bir bilgisayarda mı kuruyorsun?** (ör. sunum laptopu) → [`KURULUM.md`](KURULUM.md)'ye bak. Kurduktan sonra **`kurulum.bat`** (tek seferlik) ve **`baslat.bat`** (her çalıştırma) ile tek tıkla yönetebilirsin.

MongoDB'nin çalıştığından emin olun (yerel kurulumda servis otomatik başlar).

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env       # .env'i düzenle: MONGODB_URI, JWT_SECRET
npm run seed                # Örnek veri yükle (admin + örnek sürüş)
npm run dev                 # http://localhost:5000
```

### 2. Dashboard (web paneli)
```bash
cd dashboard
npm install
npm run dev                 # http://localhost:5173
```

Demo hesapları:
- Admin: `admin@example.com` / `admin123`
- Sürücü: `driver@example.com` / `driver123`

### 3. Sürüş Simülatörü (telefon gerekmez)
Dashboard'ın canlı çalıştığını telefon olmadan göstermek için sahte sürüş verisi üretir:
```bash
cd backend
npm run simulate            # Ctrl+C ile durdurur
```
Çalışırken `/dashboard` sayfasındaki grafik canlı akar ve alarmlar düşer.

### 4. Mobile (Expo, gerçek cihaz)
```bash
cd mobile
npm install
npx expo start              # QR kodu Expo Go ile tara
```
- **Fiziksel telefon için:** `app.json` → `extra.apiUrl` değerini bilgisayarın LAN IP'sine ayarlayın (ör. `http://192.168.1.10:5000`). Telefon ile bilgisayar **aynı WiFi'de** olmalıdır.
- Backend (5000) ve Expo (8081) portlarına güvenlik duvarı izni gerekir.
- Ayrıntılı adımlar: [`docs/calistirma_adimlari.md`](docs/calistirma_adimlari.md)

## Testler

```bash
cd backend
npm test                    # Jest — anomali detektörleri (13 test)
```

## Zorunlu Modüller (Föy 5.1 - 5.8)

| Modül | Konum |
|---|---|
| 5.1 Mobil veri toplama | `mobile/src/services/SensorService.js` |
| 5.2 Node.js backend | `backend/src/server.js` |
| 5.3 Auth + rol | `backend/src/middlewares/auth.js`, `authorize.js` |
| 5.4 Veritabanı | `backend/src/models/` |
| 5.5 Gerçek zamanlı panel | `dashboard/src/pages/Dashboard.jsx` |
| 5.6 Anomali tespit | `backend/src/services/analysis/` |
| 5.7 Alarm mekanizması | `backend/src/services/alarmService.js` + `dashboard/src/components/AlarmToast.jsx` |
| 5.8 Dokümantasyon | `docs/` + `sunum/` |

## API Dokümantasyonu

Backend ayağa kalktığında Swagger UI:
```
http://localhost:5000/api-docs
```

## Dokümantasyon ve Teslim

- **Teslim dosyaları:** [`sunum/`](sunum/) — proje raporu (Word) ve sunum (PowerPoint)
- **Teknik dokümanlar:** [`docs/`](docs/) — API, kurulum kılavuzu, sistem mimarisi, veri modeli, çalıştırma adımları, sunum notları

## Lisans

Akademik kullanım amacıyla geliştirilmiştir.
