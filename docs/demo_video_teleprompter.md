# Demo Videosu — Seslendirme Metni (Teleprompter)

**Nasıl kullanılır:**
- Bu metni ikinci bir ekrandan, telefondan veya bir teleprompter uygulamasından oku.
- **Düz paragraflar** = sesli okunacak kısım. **[YAP: ...]** satırları okunmaz; o an ne yapacağını söyler.
- Sakin ve net konuş; `…` olan yerlerde kısa dur. Toplam süre: ~3.5–4 dakika.
- Tek seferde olmak zorunda değil — her sahneyi ayrı okuyup/çekip sonra birleştirebilirsin.

---

### 🎬 Açılış
**[YAP: Sunumun kapak slaytı ekranda]**

Merhaba. Biz Bursa Teknik Üniversitesi Bilgisayar Mühendisliği öğrencileriyiz. Bugün sizlere, Node.js ile Web Programlama dönem projemiz olan *Güvenli Sürüş ve Sürücü Davranışı Analizi Platformu*'nu tanıtacağız.

---

### 🎬 Sahne 1 — Problem ve Çözüm
**[YAP: Giriş (login) ekranı görünür]**

Trafik kazalarının büyük bölümü; ani fren, sert dönüş ve ani hızlanma gibi agresif sürüş davranışlarından kaynaklanıyor. Bu davranışları ölçmek için geleneksel yöntemler, araca takılan pahalı donanımlar gerektiriyor.

Biz farklı bir yol izledik: herkesin cebinde zaten bulunan akıllı telefonu kullandık. Telefonun ivmeölçer, jiroskop ve GPS sensörlerinden gelen veriyi gerçek zamanlı analiz eden; mobil uygulama, sunucu ve web panelinden oluşan tam yığın bir platform geliştirdik.

Şimdi sisteme bir sürücü hesabıyla giriş yapıyorum.

**[YAP: driver@example.com / driver123 ile giriş yap]**

---

### 🎬 Sahne 2 — Gerçek Zamanlı İzleme *(en önemli bölüm)*
**[YAP: Dashboard sayfası; grafik canlı akıyor]**

Karşımızdaki, gerçek zamanlı izleme paneli. Şu anda telefon, araç içinde veri gönderiyormuş gibi simüle ediliyor.

Gördüğünüz grafik canlı: mavi çizgi telefonun ivmesini, yeşil çizgi ise hızı gösteriyor. Veri her yarım saniyede bir sunucuya iletiliyor; sunucudaki anomali tespit motoru bu veriyi anında analiz ediyor ve Socket.io teknolojisiyle panele canlı olarak yansıtıyor.

Riskli bir hareket olduğunda — örneğin ani bir fren — sağ üst köşede anlık bir alarm bildirimi beliriyor… İşte, şu an düşen bu bildirim gibi.

Yukarıdaki kartlarda ise toplam sürüş sayısını, toplam alarmı ve aktif sürüş durumunu görebiliyoruz.

**[YAP: En az bir alarm bildiriminin düşmesini bekle ve göster]**

---

### 🎬 Sahne 3 — Sürüş Detayı ve Harita
**[YAP: Sol menü → Sürüşler → tamamlanmış bir sürüşe Detay]**

Her sürüş otomatik olarak kaydediliyor. Tamamlanmış bir sürüşün detayına giriyorum.

Burada sürüşün süresini, kat edilen mesafeyi, ortalama hızı, tetiklenen alarm sayısını ve sıfır ile yüz arasında hesaplanan risk skorunu görüyoruz.

Hemen altında ise sürüşün rotası harita üzerinde çizili. Haritadaki kırmızı işaretler, alarmların tam olarak nerede gerçekleştiğini gösteriyor.

**[YAP: Sayfayı yavaşça aşağı kaydır; haritayı ve kırmızı işaretleri göster]**

---

### 🎬 Sahne 4 — Alarmlar
**[YAP: Sol menü → Alarmlar]**

Alarmlar sayfasında, tüm riskli olaylar; türü, şiddeti ve açıklamasıyla birlikte listeleniyor.

Sistemimiz beş farklı davranışı tespit edebiliyor: ani fren, ani hızlanma, sert dönüş, sarsıntı ve beklenmeyen hızlanma. Alarmları şiddetlerine göre de filtreleyebiliyoruz.

**[YAP: Şiddet filtresini bir kez kullan]**

---

### 🎬 Sahne 5 — Yönetici Paneli *(opsiyonel)*
**[YAP: Çıkış yap → admin@example.com / admin123 ile gir → Kullanıcılar]**

Sistemimizde iki kullanıcı rolü var. Şimdi yönetici hesabıyla giriş yapıyorum. Yönetici; tüm sürücüleri, cihazları ve alarmları görebiliyor. Bu da özellikle filo yönetimi senaryosu için büyük önem taşıyor.

---

### 🎬 Sahne 6 — Gerçek Telefon *(opsiyonel ama etkileyici)*
**[YAP: Gerçek iPhone ile çekilen klip — telefon sallanıyor, panelde alarm düşüyor]**

Ve bu sadece bir simülasyon değil. Uygulamamızı gerçek bir iPhone üzerinde de çalıştırdık. Telefonu hareket ettirdiğimizde, gerçek sensör verileriyle anomaliler tetikleniyor ve aynı anda web paneline düşüyor.

---

### 🎬 Kapanış
**[YAP: Sunumun kapanış slaytı — Teşekkürler + GitHub linki]**

Özetle; akıllı telefonu araç içi bir IoT cihazına dönüştüren, gerçek zamanlı çalışan ve gerçek bir cihazda test edilmiş bir platform geliştirdik. Projemizin tüm kaynak kodu ve dokümantasyonu GitHub'da yer alıyor.

Bizi dinlediğiniz için teşekkür ederiz. Sorularınızı memnuniyetle yanıtlarız.

---

> **Konuşmacı dağılımı önerisi:** Açılış + Sahne 1 bir kişi; Sahne 2 (en önemli) bir kişi; Sahne 3–4 bir kişi; Sahne 5–6 + Kapanış bir kişi. Böylece dört üye de konuşur (jüri "ekip üyelerinin katkısı" puanı için önemli).
