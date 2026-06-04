# Güvenli Sürüş ve Sürücü Davranışı Analizi Platformu — Proje Raporu

**Bursa Teknik Üniversitesi — Bilgisayar Mühendisliği**
**Node.js ile Web Programlama — Dönem Projesi**
**Senaryo 1: Mobil Güvenlik ve Davranış Analizi Platformu**

| Numara | Ad Soyad |
|---|---|
| 23360859019 | Melike Rana Yozgatlı |
| 23360859034 | Selen Yakın |
| 23360859739 | Talha Korkmaz |
| 22360859047 | Kubilay İnanç |

---

## Özet

Bu çalışmada, akıllı telefonu araç içinde bir IoT cihazı gibi kullanan, sürücü davranışlarını gerçek zamanlı analiz eden tam yığın (full-stack) bir platform geliştirilmiştir. Telefonun ivmeölçer, jiroskop ve GPS sensörlerinden toplanan veriler Node.js/Express tabanlı bir sunucuya iletilmekte; eşik tabanlı bir anomali tespit motoru ani fren, ani hızlanma, sert dönüş, sarsıntı ve beklenmeyen hızlanma gibi riskli davranışları belirlemektedir. Sonuçlar MongoDB'de saklanmakta, Socket.io ile web paneline canlı olarak yayınlanmakta ve harita üzerinde görselleştirilmektedir. Sistem; Jest birim testleri (13/13 başarılı) ve gerçek bir iOS cihazı üzerinde yapılan uçtan uca testlerle doğrulanmıştır. Föyde tanımlı zorunlu modüllerin tamamı karşılanmış; ayrıca Swagger, otomatik testler ve çevrimdışı veri tamponlama gibi bonus özellikler eklenmiştir.

**Anahtar kelimeler:** sürücü davranışı, anomali tespiti, IoT, Node.js, gerçek zamanlı, mobil sensör.

## Abstract

This project presents a full-stack platform that turns a smartphone into an in-vehicle IoT device for real-time driver behavior analysis. Accelerometer, gyroscope and GPS data are streamed to a Node.js/Express backend, where a threshold-based anomaly engine detects risky maneuvers such as hard braking, rapid acceleration, sharp turns, shaking and sudden speed changes. Results are stored in MongoDB, broadcast live to a React dashboard via Socket.io, and visualized on a map. The system was verified through Jest unit tests (13/13 passing) and end-to-end testing on a real iOS device. All mandatory modules defined in the project brief were implemented, along with bonus features such as Swagger documentation, automated tests and offline data buffering.

**Keywords:** driver behavior, anomaly detection, IoT, Node.js, real-time, mobile sensing.

---

## 1. Gereksinim Analizi

### 1.1 Problem Tanımı
Trafik kazalarının önemli bir kısmı agresif sürüş davranışlarından (ani fren, ani hızlanma, sert dönüş) kaynaklanmaktadır. Sürücülerin bu davranışlarının nesnel olarak ölçülmesi:
- Kişisel farkındalık yaratır
- Filo yöneticilerine veri sağlar
- Sigorta primleri için adil bir taban oluşturur

Akıllı telefonlar; ivmeölçer, jiroskop ve GPS gibi sürüş davranışı için gerekli tüm sensörleri barındırır. Bu projede telefonu **araç içi IoT düğümü** gibi kullanarak yukarıdaki problemin çözümüne yönelik tam yığın (full-stack) bir platform geliştirilmiştir.

### 1.2 Fonksiyonel Gereksinimler

| # | Gereksinim | Föy Modülü |
|---|---|---|
| F1 | Telefondan ivmeölçer + jiroskop + GPS verisi toplama | 5.1 |
| F2 | Veriyi RESTful API ile Node.js backend'e iletme | 5.1, 5.2 |
| F3 | JWT tabanlı kullanıcı girişi (admin + driver rolleri) | 5.3 |
| F4 | MongoDB'de kullanıcı, cihaz, sürüş, sensör, alarm kayıtları | 5.4 |
| F5 | Web panelinde gerçek zamanlı sensör akışı ve grafik | 5.5 |
| F6 | Eşik tabanlı anomali tespiti (ani fren, sert dönüş vb.) | 5.6 |
| F7 | Anomali tespit edildiğinde panelde alarm gösterimi + listeleme | 5.7 |
| F8 | API dokümantasyonu, kurulum kılavuzu, proje raporu | 5.8 |

### 1.3 Fonksiyonel Olmayan Gereksinimler
- **Performans:** Sensör verisi 500 ms aralıkla, gecikmesiz iletilmeli
- **Dayanıklılık:** İnternet kesintisi veriyi kaybettirmemeli (offline buffer)
- **Güvenlik:** Parolalar bcrypt ile hashlenir, JWT secret env'de saklanır, hassas alanlar response'tan filtrelenir
- **Taşınabilirlik:** Backend Node.js olduğu için Windows/Linux/macOS'ta çalışır
- **Modülerlik:** Her katman ayrı klasör, controller/service/model ayrımı net

## 2. Proje Tanımı

Sistem üç ana bileşenden oluşur:

1. **Mobil İstemci (mobile/)** — React Native (Expo). Sensör verisini toplar, API'ye gönderir.
2. **Backend (backend/)** — Node.js + Express + MongoDB + Socket.io. API, auth, analiz.
3. **Web Paneli (dashboard/)** — React + Vite + Chart.js + Leaflet. İzleme, raporlama, yönetim.

## 3. Kullanım Senaryosu

**Sürücü Hikâyesi:**
1. Sürücü mobil uygulamayı açar, email/parola ile giriş yapar.
2. "Sürüş Başlat" butonuna basar — sensörler aktive olur, backend'te Trip kaydı açılır.
3. Yola çıkar; telefon her 500 ms'de sensör verisini API'ye gönderir.
4. Ani fren yaparsa anomali algoritması bunu tespit edip alarm yaratır; sürücünün web paneline anlık toast bildirim gider.
5. Sürüş bittiğinde "Durdur"a basar; Trip kapanır, risk skoru hesaplanır.

**Yönetici Hikâyesi:**
1. Admin web paneline giriş yapar.
2. Tüm sürücülerin sürüşlerini, alarmlarını ve cihazlarını görür.
3. Riskli sürücüleri tespit eder, alarm geçmişlerini inceler.

## 4. Sistem Mimarisi

```
┌─────────────────┐        HTTP POST         ┌──────────────────────┐
│  Mobil İstemci  │ ───────────────────────> │   Node.js Backend    │
│  (React Native) │ <─────── Socket.io ──── │   (Express + JWT)    │
└─────────────────┘                          │                      │
                                              │  ┌────────────────┐ │
                                              │  │ AnomalyEngine  │ │
                                              │  │ (Detektörler)  │ │
                                              │  └────────────────┘ │
                                              └──────────┬───────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────┐
                                              │  MongoDB (Mongoose)  │
                                              └──────────┬───────────┘
                                                         │
                                              ┌──────────▼───────────┐
                                              │  Web Paneli (React)  │
                                              │  Chart.js + Leaflet  │
                                              └──────────────────────┘
```

**Katmanlar:**
1. **Sunum katmanı (Mobile + Dashboard):** Kullanıcı arayüzü
2. **API katmanı (Routes + Controllers):** HTTP isteklerini karşılar
3. **İş mantığı katmanı (Services):** Anomali tespit, alarm üretme
4. **Veri katmanı (Models):** Mongoose şemaları, DB sorgular
5. **Gerçek zamanlı katman (Socket.io):** Canlı veri yayını

## 5. Veri Modeli

Beş ana Mongoose şeması — `backend/src/models/`:

```
User ────┐
         │ 1:N
         ▼
       Device ─────┐
                   │ 1:N
                   ▼
                 Trip ──────┬─── SensorData (1:N, çok yoğun)
                            │
                            └─── Alarm (1:N)
```

**User** — Kullanıcı bilgileri, rol (admin/driver), bcrypt hash'li parola.
**Device** — Sürücünün telefonu; UUID, model, OS, son görülme.
**Trip** — Sürüş oturumu; başlangıç/bitiş, mesafe, ortalama hız, alarm sayısı, risk skoru.
**SensorData** — Zaman damgalı her sensör örneği. En kalabalık koleksiyon, indeksli.
**Alarm** — Anomali tespit edildiğinde oluşan kayıt; tür, şiddet, ölçülen değer, eşik.

Detaylar: `docs/veri_modeli.md` veya doğrudan model dosyalarındaki yorum bloklarına bakın.

## 6. Kullanılan Teknolojiler

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Backend runtime | **Node.js 18+** | Föyün gereksinimi |
| Web framework | **Express.js** | Olgun, geniş ekosistem, dersin temeli |
| Veritabanı | **MongoDB + Mongoose** | Zaman serisi sensör verisi için NoSQL avantajı; esnek şema |
| Gerçek zamanlı | **Socket.io** | WebSocket + HTTP fallback + room yapısı |
| Auth | **JWT (jsonwebtoken) + bcrypt** | Stateless, ölçeklenebilir; bcrypt brute-force koruması |
| Validation | **express-validator** | Deklaratif istek doğrulama |
| Logging | **winston + morgan** | Yapılandırılabilir log seviyesi |
| API dok | **Swagger / OpenAPI** (swagger-jsdoc) | Bonus puan, interaktif test |
| Mobil | **React Native + Expo (SDK 54)** | JavaScript bilgimizle hızlı geliştirme, expo-sensors/expo-location hazır |
| Web frontend | **React + Vite** | Modern SPA, hızlı dev server, HMR |
| Görselleştirme | **Chart.js + react-chartjs-2** | Zaman serisi grafiği için |
| Harita | **Leaflet + react-leaflet** | OpenStreetMap, ücretsiz, API anahtarı gerekmez |
| Test | **Jest + Supertest** | Detector birim testleri (bonus) |
| Versiyon kontrol | **Git + GitHub (monorepo)** | Tek repo, 4 klasör |

## 7. Gerçekleştirilen Modüller

### 7.1 Mobil Veri Toplama Modülü (Föy 5.1) — `mobile/src/services/SensorService.js`
- Expo Sensors ile ivmeölçer ve jiroskop (rad/s), Expo Location ile GPS (lat, lon, speed)
- **Yerçekimi kompanzasyonu:** Ham ivme yerçekimini içerdiğinden, low-pass filtre ile yerçekimi tahmin edilip çıkarılır; böylece sürücünün gerçek hareket ivmesi (lineer ivme) ölçülür
- Saniyede 2 örnek (500 ms aralık), ~3 sn'lik batch'lerle gönderim
- Offline tampon (`OfflineBuffer.js`) — AsyncStorage, max 1000 örnek
- React Native + Expo (SDK 54), gerçek iOS cihazında test edildi

### 7.2 Backend Modülü (Föy 5.2) — `backend/src/`
- Express MVC mimarisi
- Centralize edilmiş error handler
- CORS, body parser, morgan logging
- Modüler route/controller yapısı

### 7.3 Auth & Rol Modülü (Föy 5.3) — `backend/src/middlewares/`
- `auth.js` — JWT doğrulama
- `authorize.js` — Rol bazlı izin (admin / driver)
- `authController.js` — register, login, /me

### 7.4 Veritabanı Modülü (Föy 5.4) — `backend/src/models/`
- 5 Mongoose şeması
- İndeksler (timestamp, tripId, userId)
- Virtual field (Trip.isActive)
- Static metodlar (User.hashPassword)

### 7.5 Gerçek Zamanlı İzleme Paneli (Föy 5.5) — `dashboard/`
- React Router ile çok sayfalı SPA
- Socket.io client ile canlı veri akışı
- Chart.js zaman serisi grafikleri
- Leaflet ile rota haritası

### 7.6 Anomali Tespit Modülü (Föy 5.6) — `backend/src/services/analysis/`
- **5 detektör** (`detectors.js`): ani fren, ani hızlanma, sert dönüş, sarsıntı, beklenmeyen hızlanma
- **Yumuşatma** (`smoothing.js`): hareketli ortalama (5'lik pencere)
- **Engine** (`AnomalyEngine.js`): Trip başına stateful motor, debounce (3 sn aynı alarm tekrarlanmaz)
- **Risk skoru** (`calculateRiskScore`): severity ağırlıklı, 0-100

### 7.7 Alarm Mekanizması (Föy 5.7) — `backend/src/services/alarmService.js` + `dashboard/src/components/AlarmToast.jsx`
- Anomali tespitinde Alarm dokümanı yaratma
- Socket.io ile kullanıcı odasına ve admin odasına yayın
- Dashboard'da toast bildirim
- Alarms sayfasında filtreli liste, "okundu" işaretleme

### 7.8 Dokümantasyon (Föy 5.8) — `docs/`
- Bu rapor
- API dokümantasyonu (Swagger UI: `/api-docs`)
- Kurulum kılavuzu
- Her klasörde alt README

## 8. Test Süreci

### 8.1 Birim Testleri (Jest)
`backend/tests/detectors.test.js` — anomali detektörleri bilinen senaryolarla test edildi ve **13 testin tamamı başarıyla geçti.**
- Normal sürüş → alarm yok (kontrol grubu)
- Eşik üstü değerler → doğru tür ve şiddette alarm
- Edge case'ler: önceki örnek yokken speeding null döner vb.

Çalıştırma: `cd backend && npm test`

### 8.2 Uçtan Uca Entegrasyon Testi
Tüm sistem (MongoDB + backend + web paneli) lokalde ayağa kaldırılarak doğrulandı:
- Backend uç noktaları (health, login/JWT, sensor-data, trips, alarms) hatasız çalışıyor.
- Anomali motoru API üzerinden **canlı alarm üretiyor** (ör. −5 m/s² fren verisi → ani fren alarmı).
- Web paneli akışı: giriş → canlı grafik → sürüş detayı (harita) → alarmlar.
- Socket.io ile canlı veri akışı ve alarm bildirimi (toast) ekran görüntüleriyle teyit edildi.

### 8.3 Gerçek Cihaz Testi (iOS)
Mobil uygulama **gerçek bir iPhone** üzerinde Expo Go ile çalıştırıldı. Telefonun gerçek ivmeölçer, jiroskop ve GPS verisi backend'e iletildi; gerçek hareketlerle anomaliler tetiklendi ve web panelinde canlı olarak görüntülendi. Bu test, sistemin yalnızca simülasyonla değil, fiziksel sensörlerle de uçtan uca çalıştığını doğrulamıştır.

### 8.4 API Testi
Swagger UI (`/api-docs`) üzerinden tüm uç noktalar interaktif olarak test edilebilir.

## 9. Karşılaşılan Zorluklar ve Kısıtlar

### 9.1 Çözülen Mühendislik Zorlukları
Geliştirme ve gerçek cihaz testi sürecinde karşılaşılan ve çözülen başlıca problemler:

1. **Sensör gürültüsü:** Ham ivmeölçer her küçük titreşimde alarm üretiyordu. Hareketli ortalama (moving average) + 3 sn debounce ile yanlış alarmlar büyük ölçüde azaltıldı.
2. **Yerçekimi etkisi:** Ham ivme yerçekimini içerdiğinden, telefon dik tutulduğunda bir eksen sürekli ~−9.8 m/s² okuyordu. Low-pass filtre ile yerçekimi tahmin edilip çıkarılarak lineer ivme (gerçek hareket) elde edildi.
3. **Canlı veri akışı (stale closure):** Mobil tarafta `setInterval` içindeki gönderim fonksiyonu güncel sürüş değerini görmüyor, veri yalnızca sürüş bitince gidiyordu. React `ref` kullanılarak düzeltildi ve anlık akış sağlandı.
4. **Araç zinciri uyumu:** Node.js 24 ile eski Expo SDK uyumsuzdu (`node:sea` hatası) ve test cihazının (iPhone 8) Expo Go sürümü yalnızca güncel SDK'ları destekliyordu. Proje Expo SDK 54'e hizalanarak çözüldü.
5. **Geçersiz GPS hızı:** iOS, hız bilgisi mevcut olmadığında −1 döndürüyordu; negatif/geçersiz değerler 0 olarak işlenecek şekilde düzeltildi.

### 9.2 Mevcut Kısıtlar
1. **Eşik kalibrasyonu:** Eşik değerleri (örn. −3 m/s² ani fren) literatürden alındı; geniş ölçekli gerçek araç testleriyle ince ayar yapmak idealdir.
2. **Telefon yönelimi:** Telefonun konumlandırılma şekli ivme eksenlerini etkiler; üretim seviyesinde bir "kalibrasyon" adımı eklenmelidir.
3. **GPS hassasiyeti:** Şehir içinde GPS hatası ±10 m'ye çıkabildiğinden "güzergâh dışına çıkma" detektörü MVP kapsamına alınmadı.
4. **Batarya tüketimi:** Sürekli GPS + sensör + WebSocket batarya tüketir; üretimde örnekleme sıklığını düşüren bir "düşük güç modu" gerekir.
5. **Veritabanı ölçekleme:** SensorData koleksiyonu hızlı büyür; üretimde MongoDB Time Series Collection veya bölümleme (partitioning) önerilir.
6. **Süre kısıtı:** Bonusların tamamı uygulanmadı (Docker, Python mikroservis, Raspberry Pi entegrasyonu, video yakalama).

## 10. Sonuç

Proje föyünün **tüm zorunlu modülleri (5.1 - 5.8)** karşılanmıştır. Bonus puan kapsamında:
- Swagger / OpenAPI entegrasyonu (+)
- Jest birim testleri (+)
- Socket.io ile gelişmiş gerçek zamanlı yapı (+)
- Offline veri tamponlama (+)

Sistem, sürücü hareketlerini saniyede 2 örnek hızında izleyebilen, anomalileri ~3 saniye içinde tespit edip yayınlayabilen, **gerçek bir iOS cihazında uçtan uca doğrulanmış**, ekipçe geliştirilmesi kolay (monorepo + bol yorumlu kod) çalışan bir prototip olarak teslim edilmektedir.
