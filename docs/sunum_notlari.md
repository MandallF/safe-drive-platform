# Sunum Notları — Jüriye Anlatım Rehberi

Föy "start-up tarzı sunum" istiyor: problem önemi → çözüm → teknik değer → demo. Bu dokuman ekip içi prova ve sunum notları.

## Sunum Akışı (10-12 dk)

### 1. Problem (1 dk)
- "Trafik kazalarının %X'i agresif sürüşten kaynaklanıyor."
- "Geleneksel filo yönetiminde sürücü davranışını ölçmek için pahalı OBD-II dongle'lar gerek."
- "Bizim önerimiz: herkesin cebindeki cihaz — telefon."

### 2. Çözüm (1 dk)
- "Mobil + backend + web paneli üçlüsünden oluşan tam yığın bir platform geliştirdik."
- "Telefondan sensör verisi alıyoruz, gerçek zamanlı analiz ediyoruz, sürücüye anında geri bildirim veriyoruz."

### 3. Teknik Değer (3 dk)
- Sistem mimarisi diyagramını göster (`docs/sistem_mimarisi.md`)
- "5 farklı anomali tespit algoritması (ani fren, ani hızlanma, sert dönüş, sarsıntı, beklenmeyen hızlanma)"
- "Eşik tabanlı + moving average yumuşatma + debounce → düşük false-positive"
- "Risk skoru: severity ağırlıklı, 0-100"
- "Offline buffer ile internet kesintilerine dayanıklı"
- "Socket.io ile <3 sn alarm gecikmesi"

### 4. Demo (5 dk) — EN ÖNEMLİ BÖLÜM
Önceden hazırlanmış senaryo:
1. Backend ve dashboard'u aç — seed yüklü olsun
2. Driver hesabıyla giriş yap
3. Dashboard sayfasını göster — canlı grafik boş
4. Telefonda Expo Go ile uygulamayı aç, giriş yap
5. "Sürüş Başlat"a bas — dashboard'da grafik canlanmaya başlar
6. **Telefonu hızlıca aşağı doğru salla** — "ani fren" anomalisini tetikler
7. Dashboard'a toast bildirim düşer — heyecan anı!
8. Trips → en son sürüş → detay → haritada alarm marker'larını göster
9. "Bonus" olarak `/api-docs` Swagger UI'ı aç — interaktif test
10. Admin hesabına geç — tüm sürücüleri gösteren admin paneli

### 5. Kullanıcı Faydası (1 dk)
- Bireysel sürücü: sürüş kalitesi geri bildirimi
- Filo yöneticisi: tüm araçların gerçek zamanlı takibi
- Sigorta: usage-based pricing için veri

### 6. Soru-Cevap (2 dk)

## Olası Sorular ve Cevaplar

**S: Eşik değerleri nasıl belirlendi?**
C: Literatürdeki sürüş davranışı araştırmalarından (örn. SAE J3194 standartı, NHTSA verileri) alındı. -3 m/s² fren eşiği "agresif" kategori için yaygın kabul. Üretimde gerçek araç testleri ile kalibrasyon gerekir.

**S: Telefon kucakta yanlış yönde durursa?**
C: Şu an telefon yönünün araç ekseniyle hizalı olduğunu varsayıyoruz. Üretimde "kalibrasyon" adımı eklenebilir — sürücü ilk birkaç saniye düz gitsin, biz eksen rotasyonunu hesaplayalım.

**S: Anomali tespiti neden eşik tabanlı, ML değil?**
C: Eşik tabanlı algoritmalar (a) deterministik, (b) açıklanabilir, (c) eğitim verisi gerektirmez. Föy MVP için eşik tabanlı yöntemi yeterli kabul ediyor (5.6). Bonus olarak Python mikroservis + scikit-learn ile ML eklenebilir.

**S: MongoDB neden PostgreSQL değil?**
C: SensorData zaman serisi verisi, esnek şema avantajı sağlıyor. MongoDB v5+ Time Series Collection bu kullanım için optimize. PostgreSQL + TimescaleDB de geçerli bir alternatifti.

**S: Gerçek zamanlı yapı için Socket.io neden polling değil?**
C: Polling saniyede 1+ HTTP request = sunucuda boş yere yük. WebSocket persistent connection = düşük gecikme + düşük overhead. Socket.io ek olarak room yapısı + auto-reconnect veriyor.

**S: Production'a ne kadar yakın?**
C: MVP seviyesinde. Production için: HTTPS, Docker, CI/CD, monitoring (Prometheus), error tracking (Sentry), MongoDB replica set, Socket.io Redis adapter, batarya optimizasyonu gerekir.

**S: Hangi kısmı en zor oldu?**
C: Mobil sensör verisinin gürültüden ayıklanması ve gerçekçi anomali eşiği belirlemek. İlk denemelerde her küçük titreşim alarm tetikliyordu — moving average + debounce ile bunu çözdük.

## Demo Backup Planı

Demo sırasında bir şey çalışmazsa:
1. **Seed yüklü:** Hazır 1 trip + 2 alarm zaten var. TripDetail sayfası işe yarar görsel sunar.
2. **Mobil çökerse:** Postman ile manuel POST /api/sensor-data → anomali tetikler.
3. **MongoDB ulaşılamazsa:** `mongod` çalışıyor mu? Servis yeniden başlat.

## Ekip İçi Görev Dağılımı (Sunum İçin)

Görev dağılımı henüz yapılmamış. Sunum gününde her üye en az 1 modülü anlatabilmeli — bu pratik için ekip toplantısında her üye 1 modülü 2 dakikada anlatma provası yapsın:
- Parça 1 (Mobile): SensorService.js + offline buffer
- Parça 2 (Backend API): server.js + JWT + endpoint'ler
- Parça 3 (DB + Analiz): models + AnomalyEngine + detektörler
- Parça 4 (Dashboard + Rapor): React + Chart.js + harita
