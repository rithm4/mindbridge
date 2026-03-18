# MindBridge — Platformă Psihologie Online

Platformă completă pentru psihologi și pacienți: înregistrare cu roluri, programări, apeluri video WebRTC peer-to-peer și calendar săptămânal.

---

## Structura proiectului

```
mindbridge/
├── mindbridge.code-workspace   ← Deschide ACEST fișier în VS Code
├── setup-git.sh                ← Script inițializare Git
│
├── backend/                    ← Node.js + Express + MongoDB
│   ├── .env.example
│   └── src/
│       ├── server.js           ← Entry point
│       ├── config/             ← DB + Socket.io signaling
│       ├── controllers/        ← auth, user, appointment
│       ├── middleware/         ← JWT auth + rol
│       ├── models/             ← User, Appointment
│       └── routes/
│
└── frontend/                   ← React 18 + Vite + TailwindCSS
    ├── .env.example
    └── src/
        ├── App.jsx             ← Router cu toate rutele
        ├── context/            ← AuthContext, SocketContext
        ├── hooks/              ← useWebRTC, useAppointments
        ├── pages/              ← Login, Register, Dashboard,
        │                          Appointments, Calendar,
        │                          Book, VideoCall, Profile
        ├── components/common/  ← AppShell, Modal, Spinner, Toast
        └── utils/api.js        ← Axios + auto-refresh JWT
```

---

## Pornire rapidă în VS Code

**1. Deschide workspace-ul:**
```
File → Open Workspace from File → mindbridge.code-workspace
```

**2. Rulează task-ul:**
```
Terminal → Run Task → 🚀 Start All
```

---

## Instalare manuală

### Backend
```bash
cd backend
npm install
cp .env.example .env   # completează variabilele
npm run dev            # → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev            # → http://localhost:5173
```

### Variabile .env backend
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindbridge
JWT_SECRET=string_random_lung_minim_32_caractere
JWT_REFRESH_SECRET=alt_string_random_diferit
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Variabile .env frontend
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Push pe GitHub

```bash
bash setup-git.sh
# urmează instrucțiunile afișate
```

---

## Funcționalități MVP

| Funcție | Status |
|---------|--------|
| Înregistrare Psiholog / Pacient | ✅ |
| Autentificare JWT + refresh | ✅ |
| Dashboard cu statistici | ✅ |
| Calendar săptămânal | ✅ |
| Programare sesiune | ✅ |
| Confirmare / Anulare programare | ✅ |
| Apel video WebRTC P2P | ✅ |
| Toggle microfon / cameră | ✅ |
| Profil editabil | ✅ |
