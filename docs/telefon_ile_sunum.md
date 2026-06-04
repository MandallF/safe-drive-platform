# Telefon ile Canlı Sunum — Sıfırdan Laptop Kurulumu (A'dan Z'ye)

Bu rehber; laptopta hiçbir şey kurulu değilken başlayıp, **gerçek telefonun canlı veri gönderdiği** ana kadar her adımı anlatır. Sunumu telefon üzerinden yapacaklar içindir.

> 🛟 Her ihtimale karşı **demo videosu + slaytlar** (`sunum/`) laptopta hazır olsun.

---

## BÖLÜM 1 — Laptop hazırlığı (sunumdan önce, bir kez)

### ADIM 1 — Node.js kur
1. Tarayıcıda **nodejs.org** → büyük yeşil **LTS** butonu → inen `.msi`'ye çift tıkla.
2. Next → "I accept" → Install → Finish.

### ADIM 2 — MongoDB kur
1. **mongodb.com/try/download/community** → Platform: Windows, Package: msi → **Download**.
2. İnen dosyaya çift tıkla → **Complete** → **"Install MongoDB as a Service" işaretli kalsın** → Install → Finish.

### ADIM 3 — Projeyi indir
1. **github.com/MandallF/safe-drive-platform** → yeşil **Code** → **Download ZIP**.
2. İnen ZIP → sağ tık → **Tümünü ayıkla** → **Masaüstü**'nü seç.
3. **`safe-drive-platform-main`** klasörü oluşur.

### ADIM 4 — Kurulum (tek seferlik)
1. Klasördeki **`kurulum.bat`**'a çift tıkla. ("Windows korudu" çıkarsa → Ek bilgi → Yine de çalıştır.)
2. Siyah pencerede yazılar akar; **"KURULUM TAMAMLANDI"** yazınca bir tuşa bas.

---

## BÖLÜM 2 — Telefon ve ağ hazırlığı (sunumdan önce, bir kez)

### ADIM 5 — Telefona Expo Go kur
- App Store (iPhone) → **Expo Go** → kur. (Varsa güncelle.)

### ADIM 6 — Aynı ağa al (telefon hotspot'u önerilir)
**Hotspot yöntemi (sınıf WiFi'sine güvenmiyorsan en sağlamı):**
1. iPhone → **Ayarlar → Kişisel Erişim Noktası → "Başkalarının Katılmasına İzin Ver"** aç (mobil veri açık).
2. Laptop → WiFi listesinden **telefonunu seç**, bağlan.

*(Alternatif: telefon ve laptop aynı normal WiFi'ye bağlanır.)*

### ADIM 7 — Laptopun IP'sini öğren ve app.json'a yaz
1. Laptopta **PowerShell** aç → `ipconfig` yaz → Enter.
2. **Wi-Fi** bölümündeki **IPv4 Adresi**'ni bul (hotspot'ta genelde `172.20.10.x`).
3. Klasörde `mobile\app.json` dosyasını **Not Defteri** ile aç.
4. `"apiUrl"` satırını bulup IP'yi güncelle, kaydet:
   ```json
   "apiUrl": "http://172.20.10.2:5000"
   ```
   *(IP'yi kendi `ipconfig` değerinle değiştir.)*

### ADIM 8 — Güvenlik duvarı izni (tek seferlik)
1. Başlat → "PowerShell" → **sağ tık → Yönetici olarak çalıştır**.
2. Şu iki komutu çalıştır:
   ```powershell
   netsh advfirewall firewall add rule name="SafeDrive 5000" dir=in action=allow protocol=TCP localport=5000
   netsh advfirewall firewall add rule name="SafeDrive 8081" dir=in action=allow protocol=TCP localport=8081
   ```

---

## BÖLÜM 3 — Sunum anı (her çalıştırma)

### ADIM 9 — Servisleri başlat
- Klasördeki **`baslat-telefon.bat`**'a çift tıkla.
- Bu; backend, dashboard ve Expo'yu açar, tarayıcıda paneli getirir. (Simülatör başlatmaz.)

### ADIM 10 — Laptopta panele giriş yap
- Açılan tarayıcıda `driver@example.com` / `driver123` ile giriş yap, **Dashboard** sayfasında kal. (Seyirci bu ekranı görecek.)

### ADIM 11 — Telefonu bağla
1. "Expo" penceresindeki **QR kodu** iPhone kamerasıyla tara → Expo Go açılır (ilk yükleme ~1 dk).
2. Telefonda `driver@example.com` / `driver123` ile giriş yap.

### ADIM 12 — Canlı veri gönder
1. Telefonda **"Sürüş Başlat"** → konum izni → **İzin Ver**.
2. Telefonu **hareket ettir / salla**.
3. ✅ Laptoptaki dashboard'da grafik canlı akar, sert hareketlerde **alarm** düşer.

---

## Sorun giderme
| Sorun | Çözüm |
|---|---|
| Telefonda "Network Error" | app.json'daki IP doğru mu? Firewall yapıldı mı? Aynı ağda mı? |
| QR taranınca açılmıyor | Expo Go kurulu mu? "Expo" penceresi açık mı? |
| Panelde telefon verisi yok | Panelde **driver** ile giriş + Dashboard sayfasında mısın? Telefonda sürüş başladı mı? |
| Mongo hatası | `Start-Service MongoDB` |

## Hatırlatma
- Bunu **sunumdan önce bir kez baştan sona dene.**
- IP her ağ değişiminde değişebilir → demo öncesi `ipconfig` ile kontrol et, app.json'ı güncelle.
