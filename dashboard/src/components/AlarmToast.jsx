/**
 * AlarmToastContainer
 * --------------------
 * Backend Socket.io üzerinden 'alarm:new' yayınladığında ekranın
 * sağ üstüne 5 saniye boyunca toast bildirimi gösterir.
 * Föy 5.7 "Alarm / bildirim mekanizması" gereksinimine doğrudan katkı.
 */
import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

const SEVERITY_LABELS = {
  hard_brake: 'Ani Fren',
  rapid_acceleration: 'Ani Hızlanma',
  sharp_turn: 'Sert Dönüş',
  shake: 'Sarsıntı',
  speeding: 'Beklenmeyen Hızlanma',
  off_route: 'Güzergâh Dışı'
};

export default function AlarmToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const socket = getSocket();

    function handleAlarm(alarm) {
      const id = Math.random().toString(36);
      setToasts((prev) => [...prev, { ...alarm, _id: id }]);

      // 5 saniye sonra otomatik kaldır
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t._id !== id));
      }, 5000);
    }

    socket.on('alarm:new', handleAlarm);
    return () => socket.off('alarm:new', handleAlarm);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((alarm) => (
        <div key={alarm._id} className="toast">
          <div className="toast-title">
            ⚠️ {SEVERITY_LABELS[alarm.type] || alarm.type}
            <span className={`badge ${alarm.severity}`} style={{ marginLeft: 8 }}>
              {alarm.severity}
            </span>
          </div>
          <div className="toast-body">{alarm.details}</div>
        </div>
      ))}
    </div>
  );
}
