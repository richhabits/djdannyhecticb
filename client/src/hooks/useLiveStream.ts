import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseLiveStreamOptions {
  streamId?: string;
  userId: string;
  username: string;
  isHost?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

interface StreamReaction {
  emoji: string;
  x: number;
  y: number;
}

export function useLiveStream(options: UseLiveStreamOptions) {
  const { streamId, userId, username, isHost = false } = options;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<StreamReaction[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const newSocket = io(`${socketUrl}/streaming`, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[LiveStream] Connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Stream events
    newSocket.on('stream:started', (data) => {
      console.log('[LiveStream] Stream started:', data);
    });

    newSocket.on('stream:joined', (data) => {
      setViewerCount(data.viewerCount);
    });

    newSocket.on('stream:viewer-joined', (data) => {
      setViewerCount(data.viewerCount);
    });

    newSocket.on('stream:viewer-left', (data) => {
      setViewerCount(data.viewerCount);
    });

    newSocket.on('stream:ended', () => {
      console.log('[LiveStream] Stream ended');
      cleanup();
    });

    // Chat events
    newSocket.on('stream:chat', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message].slice(-100));
    });

    // Reaction events
    newSocket.on('stream:reaction', (reaction: StreamReaction) => {
      setReactions(prev => [...prev, reaction]);
      
      // Remove reaction after animation (3 seconds)
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r !== reaction));
      }, 3000);
    });

    // WebRTC signaling
    newSocket.on('webrtc:offer', handleWebRTCOffer);
    newSocket.on('webrtc:answer', handleWebRTCAnswer);
    newSocket.on('webrtc:ice-candidate', handleICECandidate);

    return () => {
      newSocket.close();
      cleanup();
    };
  }, []);

  // Start streaming (host)
  const startStream = async (title: string, description?: string) => {
    if (!socket || !isHost) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      setLocalStream(stream);

      // Create WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc:ice-candidate', {
            streamId,
            candidate: event.candidate,
            to: 'broadcast',
          });
        }
      };

      // Start stream on server
      socket.emit('stream:start', { title, description, userId });
    } catch (error) {
      console.error('[LiveStream] Failed to start stream:', error);
      throw error;
    }
  };

  // Join stream (viewer)
  const joinStream = async () => {
    if (!socket || !streamId) return;

    socket.emit('stream:join', { streamId, userId });

    // Create peer connection for receiving
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    peerConnectionRef.current = peerConnection;

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          streamId,
          candidate: event.candidate,
          to: 'host',
        });
      }
    };
  };

  // End stream (host)
  const endStream = () => {
    if (!socket || !streamId) return;

    socket.emit('stream:end', { streamId });
    cleanup();
  };

  // Leave stream (viewer)
  const leaveStream = () => {
    if (!socket || !streamId) return;

    socket.emit('stream:leave', { streamId, userId });
    cleanup();
  };

  // Send chat message
  const sendMessage = (message: string) => {
    if (!socket || !streamId) return;

    socket.emit('stream:chat', {
      streamId,
      message,
      userId,
      username,
    });
  };

  // Send reaction
  const sendReaction = (emoji: string) => {
    if (!socket || !streamId) return;

    socket.emit('stream:reaction', {
      streamId,
      emoji,
    });
  };

  // WebRTC signaling handlers
  async function handleWebRTCOffer(data: { offer: RTCSessionDescriptionInit; from: string }) {
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(data.offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    socket?.emit('webrtc:answer', {
      streamId,
      answer,
      to: data.from,
    });
  }

  async function handleWebRTCAnswer(data: { answer: RTCSessionDescriptionInit; from: string }) {
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(data.answer);
  }

  async function handleICECandidate(data: { candidate: RTCIceCandidateInit; from: string }) {
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.addIceCandidate(data.candidate);
  }

  // Cleanup
  function cleanup() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
  }

  return {
    isConnected,
    viewerCount,
    chatMessages,
    reactions,
    localStream,
    remoteStream,
    startStream,
    joinStream,
    endStream,
    leaveStream,
    sendMessage,
    sendReaction,
  };
}
