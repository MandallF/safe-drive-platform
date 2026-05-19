# Veri Modeli (Mongoose Şemaları)

## Varlık-İlişki Diyagramı (ER)

```
┌──────────────┐
│    User      │
│──────────────│
│ _id          │
│ name         │
│ email (uniq) │
│ passwordHash │
│ role         │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│   Device     │
│──────────────│
│ _id          │
│ userId (FK)  │
│ deviceUuid   │
│ model        │
│ os           │
│ lastSeenAt   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐         ┌──────────────────┐
│    Trip      │── 1:N ─▶│   SensorData     │
│──────────────│         │──────────────────│
│ _id          │         │ _id              │
│ userId       │         │ tripId (FK)      │
│ deviceId     │         │ deviceId (FK)    │
│ startedAt    │         │ timestamp        │
│ endedAt      │         │ accelX/Y/Z       │
│ distanceM    │         │ gyroX/Y/Z        │
│ avgSpeedKmh  │         │ lat, lon, speed  │
│ alarmCount   │         └──────────────────┘
│ riskScore    │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│    Alarm     │
│──────────────│
│ _id          │
│ userId       │
│ tripId       │
│ type         │
│ severity     │
│ timestamp    │
│ lat, lon     │
│ measuredValue│
│ threshold    │
│ details      │
│ isRead       │
└──────────────┘
```

## Şema Detayları

### User
| Alan | Tip | Notlar |
|---|---|---|
| _id | ObjectId | Mongoose otomatik |
| name | String | 2-80 karakter |
| email | String | unique, lowercase, email regex |
| passwordHash | String | bcrypt, `select: false` |
| role | enum | 'admin' \| 'driver', default 'driver' |
| createdAt, updatedAt | Date | timestamps: true |

### Device
| Alan | Tip | Notlar |
|---|---|---|
| userId | ObjectId | ref: User, indexed |
| deviceUuid | String | unique, telefonun kararlı ID'si |
| model | String | default 'Bilinmiyor' |
| os | enum | 'ios' \| 'android' \| 'web' \| 'unknown' |
| lastSeenAt | Date | Her sensör verisinde güncellenir |

### Trip
| Alan | Tip | Notlar |
|---|---|---|
| userId | ObjectId | ref: User |
| deviceId | ObjectId | ref: Device |
| startedAt | Date | required |
| endedAt | Date | null = aktif |
| distanceMeters | Number | trip kapatılırken hesaplanır |
| avgSpeedKmh | Number | aggregation |
| maxSpeedKmh | Number | aggregation |
| alarmCount | Number | $inc ile artırılır |
| riskScore | Number | 0-100 |

**Virtual:** `isActive` = `endedAt === null`
**İndeks:** `{ userId: 1, startedAt: -1 }`

### SensorData (en yoğun koleksiyon)
| Alan | Tip | Notlar |
|---|---|---|
| tripId | ObjectId | ref: Trip, indexed |
| deviceId | ObjectId | ref: Device |
| timestamp | Date | telefon yaratım anı (sunucunun değil) |
| accelX/Y/Z | Number | m/s² |
| gyroX/Y/Z | Number | rad/s, default 0 |
| lat, lon | Number | GPS |
| speed | Number | km/h |

**İndeks:** Birleşik `{ tripId: 1, timestamp: 1 }` — trip zaman serisi sorguları için
**Not:** `timestamps: false` — `timestamp` field'ını biz yönetiyoruz

### Alarm
| Alan | Tip | Notlar |
|---|---|---|
| userId | ObjectId | indexed |
| tripId | ObjectId | indexed |
| type | enum | hard_brake, rapid_acceleration, sharp_turn, shake, speeding, off_route |
| severity | enum | low \| medium \| high |
| timestamp | Date | olayın gerçekleştiği an |
| lat, lon | Number | haritada işaretlemek için |
| measuredValue | Number | algoritmanın okuduğu değer |
| threshold | Number | aşılan eşik |
| details | String | insan okunabilir |
| isRead | Boolean | dashboard "okundu" işareti |

**İndeks:** `{ userId: 1, isRead: 1, timestamp: -1 }`

## Veri Hacmi Tahmini

| Koleksiyon | Doc/gün (1 sürücü) | Boyut (1 yıl) |
|---|---|---|
| User | 0 | KB |
| Device | 0 | KB |
| Trip | ~5 | ~1 MB |
| SensorData | ~30k (8h sürüş × 7200) | ~1 GB |
| Alarm | ~50 | ~5 MB |

**Optimizasyon önerileri (üretim):**
- SensorData için MongoDB Time Series Collection
- 30 günden eski raw veriyi aggregated özetlere indirme
- Cold storage (S3) ile arşivleme
