/**
 * ============================================================
 * Socket.io Kurulumu ve Yönetimi
 * ============================================================
 *
 * Föy 5.5: "En az bir sayfada gerçek zamanlı veri güncellemesi bulunmalıdır."
 * Bunu Socket.io ile yapıyoruz. WebSocket altyapısı üzerinde HTTP fallback
 * destekleyen, oda (room) yapısı sunan olgun bir kütüphane.
 *
 * Oda stratejisi:
 *   - user:<userId>  : Sürücünün kendi dashboard'u — yalnızca kendi alarmlarını alır.
 *   - role:admin     : Tüm admin'ler — tüm sistemdeki alarmları alır.
 *   - trip:<tripId>  : Belirli bir trip'i izleyenler (canlı harita gibi).
 *
 * Kimlik doğrulama:
 *   Socket.io handshake sırasında client JWT'sini auth.token olarak gönderir.
 *   Doğrulanır, doğrulanmazsa bağlantı reddedilir.
 * ============================================================
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let ioInstance = null;

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  // ----- Auth middleware (handshake) -----
  // Her yeni bağlantıdan önce çalışır. Token geçersizse next(error) ile reddet.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Token gonderilmedi'));
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = payload; // { id, role, email, ... }
      next();
    } catch (err) {
      logger.warn(`Socket auth basarisiz: ${err.message}`);
      next(new Error('Gecersiz token'));
    }
  });

  // ----- Connection handler -----
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket baglandi: user=${user.id} role=${user.role}`);

    // Kullanıcıyı kendi odasına ekle
    socket.join(`user:${user.id}`);

    // Admin'leri ortak admin odasına ekle
    if (user.role === 'admin') {
      socket.join('role:admin');
    }

    // İstemci belirli bir trip'i izlemek isterse
    socket.on('trip:subscribe', (tripId) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on('trip:unsubscribe', (tripId) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket koptu: user=${user.id} reason=${reason}`);
    });
  });

  ioInstance = io;
  logger.info('Socket.io baslatildi.');
  return io;
}

/**
 * Diğer modüllerin io'ya erişimi için singleton getter.
 * Controller'lar bunu çağırıp emit edebilir.
 */
function getSocketIO() {
  return ioInstance;
}

module.exports = { initializeSocket, getSocketIO };
