# Safe Drive Dashboard

React + Vite + Chart.js + Leaflet web paneli.

## Kurulum

```bash
npm install
npm run dev          # http://localhost:5173
```

Backend'in `http://localhost:5000` üzerinde çalışıyor olması gerekir.
Vite proxy `/api` ve `/socket.io` isteklerini backend'e yönlendirir.

## Sayfalar

| Yol | Yetki | İşlev |
|---|---|---|
| `/login` | — | Giriş |
| `/register` | — | Kayıt |
| `/dashboard` | Token | Gerçek zamanlı sensör akışı (Chart.js) |
| `/trips` | Token | Sürüş listesi |
| `/trips/:id` | Token | Sürüş detay + harita (Leaflet) + grafik |
| `/alarms` | Token | Alarm listesi (filtreli) |
| `/admin/users` | Admin | Kullanıcı yönetimi |
| `/admin/devices` | Admin | Cihaz listesi |

## Mimari Notlar

- **AuthContext** — kullanıcı/token uygulama genelinde paylaşılır.
- **api.js (axios)** — tüm HTTP isteklerinde token interceptor.
- **socket.js** — singleton Socket.io bağlantısı.
- **AlarmToast** — Socket.io 'alarm:new' event'inde toast bildirim.
- **ProtectedRoute** — login değilse /login'e, admin değilse hata.
