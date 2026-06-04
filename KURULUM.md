# Yeni Bilgisayarda / Laptopta Kurulum (Sunum İçin)

Bu rehber, projeyi **sıfırdan başka bir bilgisayarda** (ör. sunum yapacağın laptop) çalıştırmak içindir.

> ⏰ **EN ÖNEMLİ TAVSİYE:** Bunu sunum gününden **önce** yap ve bir kez test et. Sunum sabahı ilk kez kurmak risklidir.
>
> 🛟 **Yedek plan:** Demo videosu + slaytlar (`sunum/` klasörü) laptopta her zaman hazır olsun. Canlı demo bir aksilikte çökerse videoyu oynatırsın — bu yüzden videoyu mutlaka çek ve laptopa kopyala.

---

## 1. Önkoşulları kur (tek seferlik)

Laptopta şunlar yoksa kur:

1. **Node.js** (LTS) — https://nodejs.org → indir, kur. (Kurulumu doğrula: yeni bir terminalde `node -v`)
2. **MongoDB Community Server** — https://www.mongodb.com/try/download/community → indir, kur.
   - Kurulumda **"Install MongoDB as a Service"** seçili olsun (otomatik başlar).
   - Alternatif: bulut veritabanı (MongoDB Atlas) — internet gerektirir, sınıf WiFi'sine güvenmiyorsan yerel kurulum daha güvenli.
3. **Git** — https://git-scm.com (projeyi klonlamak için). İstemezsen Git olmadan ZIP indirebilirsin (aşağıda).

## 2. Projeyi laptopa indir

**Git ile (önerilen):**
```
git clone https://github.com/MandallF/safe-drive-platform.git
cd safe-drive-platform
```

**Git olmadan:** GitHub'da repo sayfası → yeşil **Code** butonu → **Download ZIP** → bir klasöre çıkar.

> Klonlayınca kod + slaytlar + rapor (`sunum/`) + tüm dokümanlar laptopa gelir. Sadece **demo videosunu** ayrıca kopyalaman gerekir (o repoda olmayabilir).

## 3. Kurulum (tek seferlik) — `kurulum.bat`

MongoDB çalışırken, proje klasöründeki **`kurulum.bat`** dosyasına çift tıkla. Bu otomatik olarak:
- backend ve dashboard bağımlılıklarını kurar (`npm install`),
- `.env` dosyasını oluşturur (`.env.example`'dan),
- örnek veriyi yükler (`npm run seed`).

**Elle yapmak istersen:**
```
cd backend
npm install
copy .env.example .env
npm run seed
cd ..\dashboard
npm install
```

## 4. Çalıştırma — `baslat.bat`

Proje klasöründeki **`baslat.bat`** dosyasına çift tıkla. Bu üç pencere açar (backend, dashboard, simülatör) ve tarayıcıda paneli açar.

Giriş:
- Sürücü: `driver@example.com` / `driver123`
- Admin: `admin@example.com` / `admin123`

**Elle yapmak istersen** (3 ayrı terminal):
```
cd backend      && npm run dev        # 1. terminal
cd dashboard    && npm run dev        # 2. terminal
cd backend      && npm run simulate   # 3. terminal (canlı veri)
```
Sonra tarayıcıda `http://localhost:5173`.

## 5. (Opsiyonel) iPhone ile canlı demo

Laptopun IP'si bu bilgisayardan **farklı** olacak. Gerçek telefonla demo yapacaksan:
1. Laptopun LAN IP'sini öğren: terminalde `ipconfig` → IPv4 Address (ör. `192.168.1.25`).
2. `mobile/app.json` içindeki `extra.apiUrl` değerini bu IP'ye güncelle: `http://192.168.1.25:5000`
3. Güvenlik duvarında 5000 ve 8081 portlarına izin ver (`docs/calistirma_adimlari.md`).
4. Telefon ve laptop aynı WiFi'de olsun → `cd mobile && npx expo start` → QR'ı tara.

> Sınıfta WiFi karmaşıksa iPhone kısmını atla; **simülatörle** yapılan canlı demo da aynı sistemi gösterir.

## 6. Sunum dosyalarını açmak

`sunum/` klasöründeki `.pptx` ve `.docx` dosyalarını açmak için laptopta **Microsoft Office**, **LibreOffice** (ücretsiz) veya **Google Slides/Docs** kullanabilirsin.

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| `node` tanınmıyor | Node.js kurulu mu? Terminali kapatıp aç. |
| Backend "Mongo bağlantı hatası" | MongoDB servisi çalışıyor mu? `Get-Service MongoDB` → `Start-Service MongoDB` |
| Dashboard "Network Error" | Backend (5000) açık mı? |
| Grafik akmıyor | Simülatör çalışıyor mu + tarayıcıda Dashboard sayfasında mısın? |
| Port kullanımda | Eski pencereleri kapat, `baslat.bat`'ı tekrar çalıştır. |
