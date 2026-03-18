# API Reference — MindBridge

Base URL: `http://localhost:5000/api`

## Auth

| Method | Endpoint | Acces | Descriere |
|--------|----------|-------|-----------|
| POST | `/auth/register` | Public | Înregistrare cont nou |
| POST | `/auth/login` | Public | Autentificare |
| POST | `/auth/refresh` | Public | Reînnoire access token |
| POST | `/auth/logout` | Auth | Deconectare |

### POST /auth/register
```json
{
  "firstName": "Ion",
  "lastName": "Popescu",
  "email": "ion@exemplu.com",
  "password": "parola123",
  "role": "patient",          // sau "psychologist"
  "specialization": "CBT"     // doar pentru psihologi
}
```

### POST /auth/login
```json
{ "email": "ion@exemplu.com", "password": "parola123" }
```
Răspuns: `{ user, accessToken, refreshToken }`

---

## Users

| Method | Endpoint | Acces | Descriere |
|--------|----------|-------|-----------|
| GET | `/users/me` | Auth | Profilul meu |
| PATCH | `/users/me` | Auth | Actualizare profil |

---

## Appointments

| Method | Endpoint | Acces | Descriere |
|--------|----------|-------|-----------|
| GET | `/appointments` | Auth | Programările mele |
| GET | `/appointments/psychologists` | Auth | Lista psihologi |
| POST | `/appointments` | Pacient | Creează programare |
| PATCH | `/appointments/:id/status` | Auth | Schimbă status |
| GET | `/appointments/:id/room` | Auth | Obține videoRoomId |

### POST /appointments
```json
{
  "psychologistId": "...",
  "startTime": "2024-03-15T10:00:00.000Z",
  "duration": 50,
  "notes": "Anxietate generalizată"
}
```

### PATCH /appointments/:id/status
```json
{
  "status": "confirmed",        // pending | confirmed | cancelled | completed
  "cancellationReason": "..."   // opțional, pentru cancelled
}
```

---

## WebSocket Events (Socket.io)

### Client → Server
| Event | Payload | Descriere |
|-------|---------|-----------|
| `join-room` | `{ roomId, userId, userName }` | Intră în cameră |
| `offer` | `{ targetSocketId, offer }` | WebRTC offer |
| `answer` | `{ targetSocketId, answer }` | WebRTC answer |
| `ice-candidate` | `{ targetSocketId, candidate }` | ICE candidate |
| `media-toggle` | `{ roomId, type, enabled }` | Toggle audio/video |

### Server → Client
| Event | Payload | Descriere |
|-------|---------|-----------|
| `existing-users` | `[socketId]` | Utilizatori deja în cameră |
| `user-joined` | `{ socketId, userId, userName }` | Utilizator nou intrat |
| `user-left` | `{ socketId }` | Utilizator plecat |
| `offer` | `{ fromSocketId, offer }` | Offer primit |
| `answer` | `{ fromSocketId, answer }` | Answer primit |
| `ice-candidate` | `{ fromSocketId, candidate }` | ICE candidate primit |
| `peer-media-toggle` | `{ socketId, type, enabled }` | Peer a toggle media |
