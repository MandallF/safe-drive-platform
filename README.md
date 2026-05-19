# Güvenli Sürüş ve Sürücü Davranışı Analizi Platformu

> Bursa Teknik Üniversitesi — Bilgisayar Mühendisliği  
> Node.js ile Web Programlama Dersi — Dönem Projesi  
> Senaryo 1: Mobil Güvenlik ve Davranış Analizi Platformu

## Proje Özeti

Akıllı telefonun araç içerisinde bir IoT düğümü gibi kullanıldığı; ivmeölçer, jiroskop ve GPS verilerini Node.js backend'ine gerçek zamanlı olarak ileten; ani fren, sert dönüş, ani hızlanma gibi olağandışı sürüş davranışlarını eşik tabanlı bir analiz modülüyle tespit edip web paneli üzerinden raporlayan tam yığın bir platformdur.

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
├── backend/        # Node.js + Express + MongoDB + Socket.io (Parça 2 + 3)
├── mobile/         # React Native (Expo) — sürücünün telefonuna kurulur (Parça 1)
├── dashboard/      # React + Vite + Chart.js + Leaflet (Parça 4)
└── docs/           # Proje raporu, API dokümantasyonu, kurulum kılavuzu
```

## Hızlı Başlangıç

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env       # .env'i düzenle (MongoDB URI, JWT secret)
npm run seed                # Örnek veri yükle (admin + sample sürüş)
npm run dev                 # http://localhost:5000
```

### 2. Dashboard
```bash
cd dashboard
npm install
npm run dev                 # http://localhost:5173
```

Varsayılan admin: `admin@example.com` / `admin123`  
Varsayılan sürücü: `driver@example.com` / `driver123`

### 3. Mobile (Expo)
```bash
cd mobile
npm install
npx expo start              # QR kodu telefonda Expo Go ile tara
```

## Zorunlu Modüller (Föy 5.1 - 5.8)

| Modül | Konum |
|---|---|
| 5.1 Mobil veri toplama | `mobile/src/services/SensorService.js` |
| 5.2 Node.js backend | `backend/src/server.js` |
| 5.3 Auth + rol | `backend/src/middlewares/auth.js` |
| 5.4 Veritabanı | `backend/src/models/` |
| 5.5 Gerçek zamanlı panel | `dashboard/src/pages/Dashboard.jsx` |
| 5.6 Anomali tespit | `backend/src/services/analysis/` |
| 5.7 Alarm mekanizması | `backend/src/services/alarmService.js` + `dashboard/src/components/AlarmToast.jsx` |
| 5.8 Dokümantasyon | `docs/` |

## API Dokümantasyonu

Backend ayağa kalktığında Swagger UI şu adreste:
```
http://localhost:5000/api-docs
```

## Lisans

Akademik kullanım amacıyla geliştirilmiştir.
