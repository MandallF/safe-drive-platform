/**
 * ============================================================
 * Socket.io İstemcisi
 * ============================================================
 *
 * Tek bir socket bağlantısı kullanıyoruz (singleton). Her sayfa
 * kendi event listener'ını ekliyor, ortak bağlantı paylaşılıyor.
 *
 * Kimlik doğrulama: handshake sırasında auth.token gönderiyoruz.
 * Backend'in socket auth middleware'i bunu doğruluyor (sockets/index.js).
 * ============================================================
 */

import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io({
      auth: { token },
      // Vite dev proxy WebSocket'i de yönlendirir (vite.config.js)
    });

    socket.on('connect', () => console.log('[socket] connected'));
    socket.on('disconnect', () => console.log('[socket] disconnected'));
    socket.on('connect_error', (err) => console.warn('[socket] error:', err.message));
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
