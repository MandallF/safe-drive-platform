/**
 * ============================================================
 * Sürüş Simülatörü — Telefon Olmadan Canlı Demo
 * ============================================================
 *
 * Amaç: Fiziksel telefon olmadan, dashboard'ın gerçek zamanlı çalıştığını
 * göstermek. Bu script bir sürücüyü taklit eder:
 *   1) driver hesabıyla login olur, JWT alır
 *   2) Yeni bir trip başlatır
 *   3) Her 500 ms'de gerçekçi sensör verisi üretip backend'e POST eder
 *   4) Arada bilinçli olarak anomali enjekte eder (ani fren, sert dönüş,
 *      ani hızlanma) — böylece dashboard'da alarm toast'ları düşer
 *   5) Ctrl+C ile trip'i düzgünce kapatır
 *
 * Çalıştırma:
 *   node scripts/simulate.js
 *   (veya)  npm run simulate
 *
 * NOT: Node 18+ built-in fetch kullanır — ekstra bağımlılık yok.
 *      Backend'in çalışıyor olması gerekir (npm run dev).
 *
 * Dashboard'ı açıp driver@example.com ile giriş yaparsanız, bu script
 * çalışırken grafiklerin canlandığını ve alarmların düştüğünü görürsünüz.
 * Video/sunum için ideal.
 * ============================================================
 */

const API = process.env.API_URL || 'http://localhost:5000/api';
const EMAIL = process.env.SIM_EMAIL || 'driver@example.com';
const PASSWORD = process.env.SIM_PASSWORD || 'driver123';
const DEVICE_UUID = 'simulator-device-uuid-0001';
const INTERVAL_MS = 500; // saniyede 2 örnek (mobil ile aynı hız)

// Renkli konsol çıktısı için küçük yardımcılar (bağımlılık yok)
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`
};

let token = null;
let tripId = null;
let tick = 0;
let running = true;

// Bursa civarı başlangıç koordinatı — harita demoda anlamlı görünsün
let lat = 40.197;
let lon = 29.060;

// --- Anomali "burst" durumu ---
// ÖNEMLİ: Gerçek bir ani fren tek bir 500ms örnek değil, 1-2 saniye sürer.
// Backend'deki 5'lik moving average (gürültü filtresi) TEK örneklik bir sıçramayı
// 4 normal değerle ortalayıp eşiğin altına çeker — yani tek-örnek anomali alarm üretmez.
// Bu yüzden anomaliyi ARDIŞIK birkaç örnek boyunca sürdürüyoruz ki yumuşatmadan
// sonra da eşiği geçsin ve gerçekçi şekilde alarm tetiklensin.
let burstType = null;
let burstRemaining = 0;
const BURST_LENGTH = 6; // 6 x 500ms = ~3 saniye — moving average penceresini doyurur

/**
 * Backend'e kimlikli istek atan yardımcı.
 */
async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Tek bir gerçekçi sensör örneği üret.
 * Çoğu örnek "normal sürüş"; belirli tick'lerde anomali enjekte edilir.
 */
function generateSample() {
  tick++;

  // Hız: 30-60 km/h arası sinüzoidal dalga + gürültü
  const baseSpeed = 45 + Math.sin(tick / 20) * 15;
  const speed = Math.max(0, baseSpeed + (Math.random() - 0.5) * 3);

  // Normal ivme: yerçekimi (z≈9.8) + küçük gürültü
  let accelX = (Math.random() - 0.5) * 0.6;
  let accelY = (Math.random() - 0.5) * 1.2; // boylamsal — fren/gaz
  let accelZ = 9.8 + (Math.random() - 0.5) * 0.3;
  let gyroZ = (Math.random() - 0.5) * 0.25; // dönüş

  let injected = null;

  // --- Anomali enjeksiyonu (demo için bilinçli, burst halinde) ---
  // Mevcut burst bittiyse, belirli tick'lerde yeni bir anomali burst'u başlat.
  if (burstRemaining === 0) {
    if (tick % 20 === 0) { burstType = 'hard_brake'; burstRemaining = BURST_LENGTH; }
    else if (tick % 32 === 0) { burstType = 'sharp_turn'; burstRemaining = BURST_LENGTH; }
    else if (tick % 44 === 0) { burstType = 'rapid_accel'; burstRemaining = BURST_LENGTH; }
  }

  // Aktif bir burst varsa, anomali değerini bu örneğe de uygula (sürekli olay).
  if (burstRemaining > 0) {
    if (burstType === 'hard_brake') {
      accelY = -5.5 - Math.random();        // sürekli sert fren (~-5.5..-6.5)
      injected = 'ANI FREN';
    } else if (burstType === 'sharp_turn') {
      gyroZ = 0.9 + Math.random() * 0.3;    // sürekli sert dönüş
      injected = 'SERT DONUS';
    } else if (burstType === 'rapid_accel') {
      accelY = 4.5 + Math.random();         // sürekli ani hızlanma
      injected = 'ANI HIZLANMA';
    }
    burstRemaining--;
  }

  // Konumu hafifçe ilerlet (kuzeydoğuya doğru hareket)
  lat += 0.00008;
  lon += 0.00004;

  return {
    sample: {
      tripId,
      deviceUuid: DEVICE_UUID,
      timestamp: new Date().toISOString(),
      accelX, accelY, accelZ,
      gyroX: 0, gyroY: 0, gyroZ,
      lat, lon, speed
    },
    injected
  };
}

async function login() {
  console.log(c.gray(`[login] ${EMAIL} olarak giris yapiliyor...`));
  const data = await apiPost('/auth/login', { email: EMAIL, password: PASSWORD });
  token = data.token;
  console.log(c.green(`[login] OK — kullanici: ${data.user.name} (${data.user.role})`));
}

async function startTrip() {
  const data = await apiPost('/trips/start', { deviceUuid: DEVICE_UUID });
  tripId = data.trip._id;
  console.log(c.green(`[trip] Surus baslatildi — tripId: ${tripId}`));
  console.log(c.blue('\nSimulasyon basliyor. Dashboard\'i acin (driver@example.com).'));
  console.log(c.gray('Durdurmak icin Ctrl+C.\n'));
}

async function endTrip() {
  if (!tripId) return;
  try {
    await apiPost(`/trips/${tripId}/end`, {});
    console.log(c.green(`\n[trip] Surus kapatildi — tripId: ${tripId}`));
  } catch (err) {
    console.log(c.red(`[trip] Kapatma hatasi: ${err.message}`));
  }
}

async function loop() {
  while (running) {
    const { sample, injected } = generateSample();
    try {
      const res = await apiPost('/sensor-data', { samples: [sample] });
      const speedStr = `${Math.round(sample.speed)} km/h`;
      if (injected) {
        console.log(
          c.yellow(`[${tick}] ${injected} enjekte edildi`) +
          c.gray(`  (hiz: ${speedStr}, accelY: ${sample.accelY.toFixed(1)}, alarm: ${res.alarmsTriggered})`)
        );
      } else if (tick % 10 === 0) {
        // Her 10 örnekte bir durum satırı (konsolu boğmamak için)
        console.log(c.gray(`[${tick}] normal surus — hiz: ${speedStr}`));
      }
    } catch (err) {
      console.log(c.red(`[${tick}] Gonderim hatasi: ${err.message}`));
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

// Ctrl+C yakalama — trip'i düzgün kapat
process.on('SIGINT', async () => {
  console.log(c.yellow('\n\nDurduruluyor...'));
  running = false;
  await endTrip();
  process.exit(0);
});

async function main() {
  try {
    await login();
    await startTrip();
    await loop();
  } catch (err) {
    console.error(c.red(`\nHATA: ${err.message}`));
    console.error(c.gray('Backend calisiyor mu? (npm run dev) ve seed yuklendi mi? (npm run seed)'));
    process.exit(1);
  }
}

main();
