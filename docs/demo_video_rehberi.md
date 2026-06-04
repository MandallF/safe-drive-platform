# Demo Videosu Rehberi

Bu rehber, projenin **3-5 dakikalık demo videosunu** sıfırdan çekmek için hazırlandı.
Kullanılacak araçlar Windows 11'de **hazır gelir, kurulum gerekmez:**
- **Xbox Game Bar** — ekran kaydı (`Win + Alt + R` ile başlat/durdur)
- **Clipchamp** — video düzenleme (klipleri birleştir, başlık ekle, dışa aktar)

> **Strateji:** Demonun tamamı tarayıcıda (dashboard) geçtiği için tek pencere kesintisiz kaydedilir. Sürüş simülatörü, kaydı başlatmadan önce terminalde çalıştırılır (terminal videoda görünmez). İstersen sonuna gerçek telefonla çekilmiş kısa bir klip eklenir.

---

## 1. Hazırlık (kayıttan ÖNCE)

1. **Temiz veri yükle** (sayılar derli toplu görünsün):
   ```bash
   cd backend
   npm run seed
   ```
2. **Üç şeyi başlat** (3 terminal):
   ```bash
   # Terminal 1 - Backend
   cd backend ; npm run dev
   # Terminal 2 - Dashboard
   cd dashboard ; npm run dev
   # Terminal 3 - Simülatör (canlı veri için)
   cd backend ; npm run simulate
   ```
3. **Tarayıcıyı hazırla:**
   - `localhost:5173` aç, ama **henüz giriş yapma** (videoda girişten başlayacağız).
   - Tarayıcıyı **tam ekran** yap (F11) — temiz görünür.
   - Yakınlaştırma `%100` olsun (`Ctrl+0`).
   - Sekme kalabalığını ve yer imi çubuğunu gizle.
4. **Dikkat dağıtıcıları kapat:**
   - Windows bildirimlerini sustur: **Rahatsız Etmeyin** (Win+N → aç).
   - WhatsApp/Discord vb. masaüstü bildirimleri kapat.
5. **Mikrofon:** Anlatımı canlı yapacaksan mikrofonun açık ve çalışır olduğundan emin ol (Game Bar'da mikrofon simgesi açık olmalı). Sessiz çekip sonra Clipchamp'te seslendirme de ekleyebilirsin.

---

## 2. Kayıt — Xbox Game Bar

1. Kaydetmek istediğin pencereyi (tarayıcı) **tıkla, aktif yap.**
2. **`Win + Alt + R`** → kayıt başlar (sağ üstte küçük bir sayaç çıkar).
   - Mikrofonu açmak/kapatmak: `Win + Alt + M`.
3. Senaryoyu uygula (aşağıda).
4. **`Win + Alt + R`** → kaydı durdur.
5. Video şuraya kaydedilir: **`Bu Bilgisayar → Videolar → Captures`** (`.mp4`).

> İpucu: Tek seferde mükemmel olmak zorunda değil. Her sahneyi **ayrı ayrı** çekip Clipchamp'te birleştirebilirsin. Hata yaparsan o sahneyi tekrar çek.

---

## 3. SENARYO (sahne sahne)

Toplam hedef: **~3.5 - 4 dakika.** Anlatım (seslendirme) metinleri aşağıda; kendi cümlelerinle de söyleyebilirsin.

### 🎬 Açılış kartı (~8 sn)
- **Ekranda:** Sunum dosyasının (`sunum/Guvenli_Surus_Sunum.pptx`) **kapak slaytı**. (Slaytı tam ekran aç veya Clipchamp'te başlık olarak ekle.)
- **Anlatım:** *"Merhaba, biz Grup 4. Bugün Güvenli Sürüş ve Sürücü Davranışı Analizi Platformumuzu tanıtacağız."*

### 🎬 Sahne 1 — Problem & Çözüm (~25 sn)
- **Ekranda:** Login sayfası.
- **Anlatım:** *"Trafik kazalarının önemli kısmı ani fren, sert dönüş gibi agresif sürüş davranışlarından kaynaklanır. Bunları ölçmek için genelde pahalı araç donanımı gerekir. Biz bunun yerine herkesin cebindeki telefonu kullanıyoruz: telefonun ivmeölçer, jiroskop ve GPS sensörleriyle sürüş davranışını gerçek zamanlı analiz eden tam yığın bir platform geliştirdik."*
- **Yap:** `driver@example.com / driver123` ile **giriş yap**.

### 🎬 Sahne 2 — Canlı İzleme (EN ÖNEMLİ, ~60 sn)
- **Ekranda:** Dashboard sayfası. Simülatör çalıştığı için grafik **canlı akıyor**, sağ üstte ara ara **alarm bildirimi** düşüyor.
- **Anlatım:** *"Şu an telefon araç içinde veri gönderiyormuş gibi simüle ediyoruz. Bu grafik gerçek zamanlı: mavi çizgi ivmeyi, yeşil çizgi hızı gösteriyor. Veri her yarım saniyede bir backend'e gidiyor, anomali motoru analiz ediyor ve Socket.io ile bu panele anında yansıyor. Ani fren gibi riskli bir hareket olduğunda — işte böyle — sağ üstte alarm bildirimi düşüyor. Üstteki kartlarda toplam sürüş, toplam alarm ve aktif sürüş durumu görünüyor."*
- **Yap:** Birkaç saniye grafiğin akmasını ve en az **bir alarm toast'ının düşmesini** göster (beklersen simülatör birkaç saniyede bir üretir).

### 🎬 Sahne 3 — Sürüş Detayı & Harita (~35 sn)
- **Ekranda:** Sol menü → **Sürüşler** → tamamlanmış bir sürüşe **Detay**.
- **Anlatım:** *"Her sürüş kaydediliyor. Burada sürüşün süresi, mesafesi, ortalama hızı, alarm sayısı ve 0-100 arası risk skoru var. Aşağıda ise sürüşün rotası harita üzerinde çiziliyor; kırmızı işaretler alarmların gerçekleştiği konumları gösteriyor."*
- **Yap:** Sayfayı yavaşça aşağı kaydır; haritayı ve alarm işaretlerini göster.

### 🎬 Sahne 4 — Alarmlar (~20 sn)
- **Ekranda:** Sol menü → **Alarmlar**.
- **Anlatım:** *"Tüm alarmlar burada listeleniyor: türü, şiddeti ve açıklamasıyla. Şiddete göre filtreleyebiliyoruz. Örneğin ani fren, sert dönüş, ani hızlanma gibi beş farklı davranışı tespit ediyoruz."*
- **Yap:** Şiddet filtresini bir kez kullan (ör. "Yüksek" seç).

### 🎬 Sahne 5 — Yönetici Paneli (opsiyonel, ~15 sn)
- **Ekranda:** Çıkış yap → `admin@example.com / admin123` ile gir → **Kullanıcılar / Cihazlar**.
- **Anlatım:** *"İki kullanıcı rolümüz var. Yönetici hesabı tüm sürücüleri, cihazları ve alarmları görebiliyor — bu da filo yönetimi senaryosu için uygun."*

### 🎬 Sahne 6 — Swagger / API (opsiyonel, ~10 sn)
- **Ekranda:** `localhost:5000/api-docs`
- **Anlatım:** *"Backend'in tüm uç noktaları Swagger ile dokümante edilmiş durumda."*

### 🎬 Sahne 7 — Gerçek Telefon (opsiyonel ama etkileyici, ~30 sn)
- **Ekranda:** (Ayrı çekilen klip) Elde telefon, Expo Go'da uygulama açık. "Sürüş Başlat" → telefon sallanıyor → PC ekranında alarm düşüyor.
- **Anlatım:** *"Ve bu sadece simülasyon değil — uygulamayı gerçek bir iPhone'da çalıştırdık. Telefonun gerçek sensörleriyle, hareket ettiğimizde anomaliler tetikleniyor ve panele anında düşüyor."*
- Çekim yöntemi için **Bölüm 4'e** bak.

### 🎬 Kapanış kartı (~12 sn)
- **Ekranda:** Sunumun **kapanış slaytı** (Teşekkürler + GitHub linki).
- **Anlatım:** *"Özetle: telefonu araç içi bir IoT cihazına dönüştüren, gerçek zamanlı, çalışan bir platform. Tüm kodumuz GitHub'da. Teşekkürler."*

---

## 4. Gerçek Telefon Kısmını Çekme (opsiyonel)

İki seçenek var:

**A) İki kişi yöntemi (en kolay ve etkileyici):**
1. Bir kişi telefonu eline alır, uygulamada "Sürüş Başlat"a basar.
2. İkinci kişi **başka bir telefonla**, hem eldeki telefonu hem arkadaki PC ekranını aynı karede çeker.
3. Telefon sallanınca PC'de alarmın düştüğü an kameraya yakalanır. (En güçlü an budur.)

**B) Telefon ekranını kaydetme:**
1. iPhone'da **Denetim Merkezi → Ekran Kaydı** ile uygulamanın ekranını kaydet.
2. PC'de Game Bar ile dashboard'u kaydet.
3. Clipchamp'te ikisini yan yana (split screen) veya arka arkaya koy.

> Not: Çekimden önce **güvenlik duvarı izni + aynı WiFi** ayarlarının yapıldığından emin ol (`docs/calistirma_adimlari.md`).

---

## 5. Birleştirme — Clipchamp

1. Başlat menüsünden **Clipchamp**'i aç → **"Yeni video oluştur".**
2. Çektiğin klipleri **içe aktar** (Videolar/Captures klasöründen sürükle).
3. Klipleri zaman çizelgesine sırayla diz.
4. **Kırp (trim):** Her klibin baş/son fazlalığını kes (örn. fare arayışları).
5. **Başlık kartları:** "Metin" sekmesinden açılış ve kapanış kartları ekle — ya da `sunum/` slaytlarının ekran görüntüsünü görsel olarak koy.
6. **(Opsiyonel) Altyazı:** Önemli cümleleri metin olarak ekle (sessiz izleyenler için faydalı).
7. **(Opsiyonel) Seslendirme:** Canlı anlatmadıysan, Clipchamp'te "Ses kaydet" ile mikrofondan anlatım ekleyebilirsin.
8. **(Opsiyonel) Hafif müzik:** Çok kısık seviyede arka plan müziği (anlatımı bastırmasın).

---

## 6. Dışa Aktarma

- Clipchamp → sağ üst **"Dışa aktar" → 1080p**.
- Çıktı `.mp4` olur. Dosyayı `sunum/` klasörüne koyabilirsin: `Guvenli_Surus_Demo.mp4`.

---

## 7. Son Kontrol Listesi

- [ ] Ses net, anlatım anlaşılır
- [ ] Grafik canlı akıyor ve en az 1 alarm düşüyor (Sahne 2)
- [ ] Harita ve alarm işaretleri net görünüyor (Sahne 3)
- [ ] Yazılar okunabilir (tarayıcı %100 zoom)
- [ ] Bildirim/pop-up girmemiş
- [ ] Süre 3-5 dakika arası
- [ ] Açılış ve kapanış kartı var
- [ ] Dosya 1080p mp4 olarak dışa aktarıldı

---

## İpuçları

- **Önce bir prova çek.** İlk denemede tıkanırsın; ikincisi çok daha akıcı olur.
- **Yavaş ve net konuş;** fare hareketlerini yavaş yap.
- Takılırsan **sahneyi ayrı çek**, sonra Clipchamp'te birleştir — tek seferde mükemmel olması gerekmez.
- Konuşma metnini ezberleme; `docs/sunum_notlari.md` ve buradaki anlatımları **yanına not** olarak al.
