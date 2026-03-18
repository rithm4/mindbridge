import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';

export default function VideoCallPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    connectionStatus,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    roomId,
    userId: user?._id,
    userName: `${user?.firstName} ${user?.lastName}`,
  });

  const localVideoRef = useRef(null);

  // Pornește apelul la montare
  useEffect(() => {
    startCall();
    return () => endCall();
  }, []);

  // Atașează stream-ul local la elementul video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleEnd = () => {
    endCall();
    navigate(-1);
  };

  const remoteEntries = Object.entries(remoteStreams);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <h1 className="font-display text-white text-lg">MindBridge — Sesiune video</h1>
          <p className="text-gray-400 text-xs mt-0.5 font-mono">{roomId}</p>
        </div>
        <StatusBadge status={connectionStatus} />
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 flex items-center justify-center">
        {connectionStatus === 'connecting' && remoteEntries.length === 0 && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Se conectează... Așteptând celălalt participant.</p>
          </div>
        )}

        <div
          className={`grid gap-4 w-full max-w-5xl ${
            remoteEntries.length === 0
              ? 'grid-cols-1'
              : remoteEntries.length === 1
              ? 'grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
          }`}
        >
          {/* Remote streams */}
          {remoteEntries.map(([socketId, stream]) => (
            <RemoteVideo key={socketId} stream={stream} socketId={socketId} />
          ))}

          {/* Local video — always visible */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!videoEnabled ? 'invisible' : ''}`}
            />
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-3 text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
              Tu {!audioEnabled && '🔇'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="py-6 flex items-center justify-center gap-4 border-t border-gray-800">
        <ControlButton
          onClick={toggleAudio}
          active={audioEnabled}
          activeIcon="🎙"
          inactiveIcon="🔇"
          activeLabel="Microfon"
          inactiveLabel="Oprit"
          color="bg-gray-800 hover:bg-gray-700"
          inactiveColor="bg-red-600 hover:bg-red-700"
        />
        <ControlButton
          onClick={toggleVideo}
          active={videoEnabled}
          activeIcon="📹"
          inactiveIcon="📵"
          activeLabel="Cameră"
          inactiveLabel="Oprită"
          color="bg-gray-800 hover:bg-gray-700"
          inactiveColor="bg-red-600 hover:bg-red-700"
        />
        <button
          onClick={handleEnd}
          className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <span className="text-xl">📵</span>
          <span className="text-xs font-medium">Închide</span>
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, socketId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-3 text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
        Participant
      </div>
    </div>
  );
}

function ControlButton({ onClick, active, activeIcon, inactiveIcon, activeLabel, inactiveLabel, color, inactiveColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl text-white transition-colors ${
        active ? color : inactiveColor
      }`}
    >
      <span className="text-xl">{active ? activeIcon : inactiveIcon}</span>
      <span className="text-xs font-medium">{active ? activeLabel : inactiveLabel}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const config = {
    idle:       { label: 'Inactiv',      color: 'bg-gray-700 text-gray-300' },
    connecting: { label: 'Se conectează', color: 'bg-yellow-900 text-yellow-300' },
    connected:  { label: 'Conectat',     color: 'bg-green-900 text-green-300' },
    error:      { label: 'Eroare',       color: 'bg-red-900 text-red-300' },
  };
  const cfg = config[status] || config.idle;
  return (
    <span className={`badge ${cfg.color} px-3 py-1`}>{cfg.label}</span>
  );
}
