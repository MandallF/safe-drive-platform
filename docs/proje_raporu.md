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
| Mobil | **React Native + Expo** | JavaScript bilgimizle hızlı geliştirme, expo-sensors hazır |
| Web frontend | **React + Vite** | Modern SPA, hızlı dev server, HMR |
| Görselleştirme | **Chart.js + react-chartjs-2** | Zaman serisi grafiği için |
| Harita | **Leaflet + react-leaflet** | OpenStreetMap, ücretsiz, API anahtarı gerekmez |
| Test | **Jest + Supertest** | Detector birim testleri (bonus) |
| Versiyon kontrol | **Git + GitHub (monorepo)** | Tek repo, 4 klasör |

## 7. Gerçekleştirilen Modüller

### 7.1 Mobil Veri Toplama Modülü (Föy 5.1) — `mobile/src/services/SensorService.js`
- Expo Sensors ile ivmeölçer (m/s²) ve jiroskop (rad/s)
- Expo Location ile GPS (lat, lon, speed)
- Saniyede 2 sample (500 ms aralık)
- Offline tampon (`OfflineBuffer.js`) — AsyncStorage, max 1000 sample

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
`backend/tests/detectors.test.js` — anomali detektörlerinin bilinen senaryolarla doğrulanması:
- Normal sürüş → alarm yok (kontrol grubu)
- Eşik üstü değerler → doğru tür ve şiddette alarm
- Edge case'ler: önceki sample yokken speeding null dönmeli vb.

Çalıştırma:
```bash
cd backend
npm test
```

### 8.2 Manuel Entegrasyon Testi
1. `npm run seed` ile örnek veriyi yükle.
2. Backend + Dashboard'u aç, driver hesabıyla giriş yap.
3. Trips sayfasında seed edilmiş trip'i görüntüle — 2 alarm görünmeli.
4. TripDetail sayfasında haritada rota ve alarm marker'ları görünmeli.

### 8.3 Postman / Bruno Koleksiyonu
Swagger UI üzerinden tüm endpoint'ler interaktif olarak test edilebilir.

## 9. Karşılaşılan Kısıtlar

1. **Gerçek araç testi eksikliği:** Eşik değerleri (örn. -3 m/s² ani fren) literatürden alındı; gerçek araç içi testle ince ayar yapmak ideal olurdu.

2. **Telefon yönelimi:** Telefonun konumlandırılma şekli ivme eksenlerini değiştirir. Üretim seviyesi bir çözümde "telefon kalibrasyonu" adımı eklenmesi gerekirdi.

3. **GPS hassasiyeti:** Şehir içinde GPS hatası ±10 m'ye çıkabilir; bu da "güzergâh dışına çıkma" detektörünü zorlaştırıyor (bu yüzden MVP'de yok).

4. **Mobil emülator vs. fiziksel cihaz:** Emülatorde gerçek hareket simüle edilemediği için anomali doğrulamayı gerçek cihazda yapmak şart.

5. **Batarya tüketimi:** Sürekli GPS + sensör + WebSocket batarya tüketir. Üretimde "düşük güç modu" eklenmesi gerekir (örneklem sıklığını düşürme).

6. **MongoDB scaling:** SensorData koleksiyonu hızlı büyür. Üretimde MongoDB Time Series Collection (5+) veya partitioning gerekir.

7. **Süre kısıtı:** Bonus özelliklerin tamamı uygulanmadı (Docker, Python mikroservis, Raspberry Pi entegrasyonu, video yakalama).

## 10. Sonuç

Proje föyünün **tüm zorunlu modülleri (5.1 - 5.8)** karşılanmıştır. Bonus puan kapsamında:
- Swagger / OpenAPI entegrasyonu (+)
- Jest birim testleri (+)
- Socket.io ile gelişmiş gerçek zamanlı yapı (+)
- Offline veri tamponlama (+)

Sistem, sürücü hareketlerini saniyede 2 örnek hızında izleyebilen, anomalileri 3 saniye içinde tespit edip yayınlayabilen, ekipçe geliştirilmesi kolay (monorepo + tipli kod + bol yorum) bir prototip olarak teslim edilmektedir.
