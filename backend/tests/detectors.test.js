/**
 * ============================================================
 * Anomali Detektörleri — Birim Testler
 * ============================================================
 *
 * Bonus puan: Föy "Test senaryoları ve otomatik testler"i bonus olarak listeliyor.
 *
 * Saf fonksiyonları DB olmadan test edebildiğimiz için bu testler hızlı.
 * `npm test` ile çalıştırılır.
 * ============================================================
 */

const {
  detectHardBrake,
  detectRapidAcceleration,
  detectSharpTurn,
  detectShake,
  detectSpeeding
} = require('../src/services/analysis/detectors');

describe('Anomali Detektörleri', () => {
  describe('detectHardBrake', () => {
    test('eşik üstündeki normal frende alarm üretmez', () => {
      expect(detectHardBrake({ accelY: -1.5, accelX: 0, accelZ: 9.8 })).toBeNull();
    });

    test('eşik altındaki ani fren alarmı üretir', () => {
      const result = detectHardBrake({ accelY: -4.5, accelX: 0, accelZ: 9.8 });
      expect(result).not.toBeNull();
      expect(result.type).toBe('hard_brake');
      expect(['low', 'medium', 'high']).toContain(result.severity);
    });

    test('çok şiddetli fren high severity verir', () => {
      const result = detectHardBrake({ accelY: -8, accelX: 0, accelZ: 9.8 });
      expect(result.severity).toBe('high');
    });
  });

  describe('detectRapidAcceleration', () => {
    test('normal hızlanmada alarm yok', () => {
      expect(detectRapidAcceleration({ accelY: 1.5 })).toBeNull();
    });

    test('eşik üstü hızlanmada alarm var', () => {
      const result = detectRapidAcceleration({ accelY: 4.5 });
      expect(result).not.toBeNull();
      expect(result.type).toBe('rapid_acceleration');
    });
  });

  describe('detectSharpTurn', () => {
    test('hafif dönüşte alarm yok', () => {
      expect(detectSharpTurn({ gyroZ: 0.2 })).toBeNull();
    });

    test('sert dönüşte alarm var', () => {
      const result = detectSharpTurn({ gyroZ: 0.8 });
      expect(result).not.toBeNull();
      expect(result.type).toBe('sharp_turn');
    });

    test('negatif yöndeki sert dönüş de yakalanır', () => {
      const result = detectSharpTurn({ gyroZ: -0.7 });
      expect(result).not.toBeNull();
    });
  });

  describe('detectShake', () => {
    test('durağan telefonda alarm yok (~9.81 magnitude)', () => {
      expect(detectShake({ accelX: 0, accelY: 0, accelZ: 9.81 })).toBeNull();
    });

    test('çok yüksek magnitude alarm tetikler', () => {
      const result = detectShake({ accelX: 10, accelY: 10, accelZ: 10 });
      expect(result).not.toBeNull();
      expect(result.type).toBe('shake');
    });
  });

  describe('detectSpeeding', () => {
    test('önceki sample yoksa null döner', () => {
      expect(detectSpeeding({ speed: 50, timestamp: Date.now() }, null)).toBeNull();
    });

    test('hız hızlı artarsa alarm', () => {
      const t1 = new Date('2025-01-01T00:00:00Z').getTime();
      const t2 = t1 + 1000; // 1 saniye sonra
      const result = detectSpeeding(
        { speed: 50, timestamp: t2 },
        { speed: 30, timestamp: t1 }
      );
      expect(result).not.toBeNull();
      expect(result.type).toBe('speeding');
    });

    test('yavaş hız artışında alarm yok', () => {
      const t1 = new Date('2025-01-01T00:00:00Z').getTime();
      const t2 = t1 + 1000;
      const result = detectSpeeding(
        { speed: 35, timestamp: t2 },
        { speed: 30, timestamp: t1 }
      );
      expect(result).toBeNull();
    });
  });
});
