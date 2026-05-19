# Safe Drive Mobile

React Native + Expo. Telefonu araç içi IoT düğümüne çevirir.

## Kurulum

```bash
npm install
npx expo start
```

Expo Go ile telefondan QR kodu tara veya emülatörden çalıştır.

## Backend Bağlantısı

`app.json` içinde `extra.apiUrl` değerini düzenle:

| Ortam | URL |
|---|---|
| Android emülator | `http://10.0.2.2:5000` (varsayılan) |
| iOS simülator | `http://localhost:5000` |
| Fiziksel cihaz | `http://<bilgisayar-LAN-IP>:5000` (ör. `http://192.168.1.10:5000`) |

## Ekranlar

- **LoginScreen** — Email + parola girişi (JWT alır, SecureStore'a koyar)
- **HomeScreen** — Son sürüşler, "Sürüş Başlat" butonu
- **TripScreen** — Aktif sürüş: anlık hız + ivme + sayaçlar, sensörler çalışıyor

## Servisler

- **SensorService** — `expo-sensors` + `expo-location` ile veri toplama (saniyede 2 sample)
- **OfflineBuffer** — internet kesintisinde AsyncStorage kuyruğu (max 1000 sample)
- **DeviceService** — kararlı cihaz UUID'si
- **api.js** — axios + JWT interceptor

## İzinler (app.json'da)

- Konum (ön plan)
- Hareket (iOS NSMotionUsageDescription)
- Aktivite tanıma (Android ACTIVITY_RECOGNITION)
