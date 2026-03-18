/**
 * Socket.io — Signaling server pentru WebRTC
 * Gestionează: join room, offer, answer, ICE candidates, disconnect
 */

const activeRooms = new Map(); // roomId -> [socketId, socketId]

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client conectat: ${socket.id}`);

    // Utilizatorul intră în camera video
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.userName = userName;

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, []);
      }
      activeRooms.get(roomId).push(socket.id);

      // Anunță ceilalți din cameră că a intrat cineva
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
      });

      // Trimite lista utilizatorilor existenți
      const existingUsers = activeRooms.get(roomId).filter((id) => id !== socket.id);
      socket.emit('existing-users', existingUsers);

      console.log(`👥 ${userName} a intrat în camera ${roomId}`);
    });

    // WebRTC: Offer (inițiere conexiune peer)
    socket.on('offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('offer', {
        fromSocketId: socket.id,
        offer,
      });
    });

    // WebRTC: Answer (răspuns la offer)
    socket.on('answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('answer', {
        fromSocketId: socket.id,
        answer,
      });
    });

    // WebRTC: ICE Candidate (schimb de candidați de rețea)
    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        fromSocketId: socket.id,
        candidate,
      });
    });

    // Toggle microfon/cameră — notifică ceilalți
    socket.on('media-toggle', ({ roomId, type, enabled }) => {
      socket.to(roomId).emit('peer-media-toggle', {
        socketId: socket.id,
        type,
        enabled,
      });
    });

    // Deconectare
    socket.on('disconnect', () => {
      if (socket.roomId) {
        const room = activeRooms.get(socket.roomId);
        if (room) {
          const updated = room.filter((id) => id !== socket.id);
          if (updated.length === 0) {
            activeRooms.delete(socket.roomId);
          } else {
            activeRooms.set(socket.roomId, updated);
          }
        }
        socket.to(socket.roomId).emit('user-left', { socketId: socket.id });
      }
      console.log(`🔴 Client deconectat: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
