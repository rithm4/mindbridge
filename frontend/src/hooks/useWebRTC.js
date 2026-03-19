import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = ({ roomId, userId, userName }) => {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle | connecting | connected | error
  const [remoteMediaStates, setRemoteMediaStates] = useState({}); // socketId -> {audio, video}

  // ── Creează o conexiune peer nouă ──────────────────────────────────────────
  const createPeer = useCallback((targetSocketId, isInitiator) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Adaugă track-urile locale
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Primește stream remote
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: remoteStream }));
    };

    // Trimite candidații ICE prin socket
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setConnectionStatus('connected');
      if (pc.connectionState === 'failed') setConnectionStatus('error');
    };

    // Dacă suntem inițiatorul, creăm offer-ul
    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('offer', {
            targetSocketId,
            offer: pc.localDescription,
          });
        })
        .catch(console.error);
    }

    peersRef.current[targetSocketId] = pc;
    return pc;
  }, []);

  // ── Pornire WebRTC ─────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    setConnectionStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
      socketRef.current = socket;

      // ── Socket events ──────────────────────────────────────────────────────

      // Utilizatori deja în cameră — devenim inițiatori față de ei
      socket.on('existing-users', (existingSocketIds) => {
        existingSocketIds.forEach((sid) => createPeer(sid, true));
      });

      // Un utilizator nou a intrat — el va trimite offer-ul
      socket.on('user-joined', ({ socketId }) => {
        createPeer(socketId, false);
      });

      // Primim offer
      socket.on('offer', async ({ fromSocketId, offer }) => {
        let pc = peersRef.current[fromSocketId];
        if (!pc) pc = createPeer(fromSocketId, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { targetSocketId: fromSocketId, answer: pc.localDescription });
      });

      // Primim answer
      socket.on('answer', async ({ fromSocketId, answer }) => {
        const pc = peersRef.current[fromSocketId];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      // Primim candidat ICE
      socket.on('ice-candidate', async ({ fromSocketId, candidate }) => {
        const pc = peersRef.current[fromSocketId];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
      });

      // Un utilizator a plecat
      socket.on('user-left', ({ socketId }) => {
        peersRef.current[socketId]?.close();
        delete peersRef.current[socketId];
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[socketId];
          return updated;
        });
      });

      // Toggle media remote
      socket.on('peer-media-toggle', ({ socketId, type, enabled }) => {
        setRemoteMediaStates((prev) => ({
          ...prev,
          [socketId]: { ...prev[socketId], [type]: enabled },
        }));
      });

      // Intrăm în cameră
      socket.emit('join-room', { roomId, userId, userName });
    } catch (err) {
      console.error('Eroare accesare cameră/microfon:', err);
      setConnectionStatus('error');
    }
  }, [roomId, userId, userName, createPeer]);

  // ── Oprire apel ────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    socketRef.current?.disconnect();
    socketRef.current = null;
    setLocalStream(null);
    setRemoteStreams({});
    setConnectionStatus('idle');
  }, []);

  // ── Toggle audio ───────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
      socketRef.current?.emit('media-toggle', {
        roomId, type: 'audio', enabled: track.enabled,
      });
    }
  }, [roomId]);

  // ── Toggle video ───────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
      socketRef.current?.emit('media-toggle', {
        roomId, type: 'video', enabled: track.enabled,
      });
    }
  }, [roomId]);

  // Curățare la unmount
  useEffect(() => () => endCall(), [endCall]);

  return {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    connectionStatus,
    remoteMediaStates,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};
