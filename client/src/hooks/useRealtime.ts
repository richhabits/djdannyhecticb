import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRealtimeOptions {
  autoConnect?: boolean;
  userId?: string;
  username?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system';
}

interface NowPlayingData {
  title: string;
  artist: string;
  coverImage?: string;
  startedAt: number;
}

interface ListenerStats {
  count: number;
  peak: number;
}

/**
 * Real-time WebSocket hook
 * Manages connection, events, and state
 */
export function useRealtime(options: UseRealtimeOptions = {}) {
  const { autoConnect = true, userId, username } = options;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);
  const [peakListeners, setPeakListeners] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);

  // Keep track of typing timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    if (!autoConnect) return;

    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);

      // Join as user
      newSocket.emit('user:join', {
        userId,
        username: username || 'Anonymous Listener',
        page: window.location.pathname,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Listener count updates
    newSocket.on('listeners:count', (data: ListenerStats) => {
      setListenerCount(data.count);
      setPeakListeners(data.peak);
    });

    // Chat messages
    newSocket.on('chat:message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message].slice(-100)); // Keep last 100 messages
    });

    // Typing indicators
    newSocket.on('chat:typing', (data: { userId: string; username: string }) => {
      setTypingUsers(prev => new Set(prev).add(data.username));
    });

    newSocket.on('chat:stop-typing', (data: { userId: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    // Now playing updates
    newSocket.on('nowplaying:update', (data: NowPlayingData) => {
      setNowPlaying(data);
    });

    // User join/leave notifications
    newSocket.on('user:joined', (data: { username: string; listenerCount: number }) => {
      const systemMessage: ChatMessage = {
        id: `join_${Date.now()}`,
        userId: 'system',
        username: 'System',
        message: `${data.username} joined the session`,
        timestamp: Date.now(),
        type: 'system',
      };
      setChatMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('user:left', (data: { username: string; listenerCount: number }) => {
      const systemMessage: ChatMessage = {
        id: `leave_${Date.now()}`,
        userId: 'system',
        username: 'System',
        message: `${data.username} left the session`,
        timestamp: Date.now(),
        type: 'system',
      };
      setChatMessages(prev => [...prev, systemMessage]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [autoConnect, userId, username]);

  /**
   * Send chat message
   */
  const sendMessage = useCallback((message: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('chat:message', { message });
  }, [socket, isConnected]);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback(() => {
    if (!socket || !isConnected) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('chat:typing');
    
    // Auto stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:stop-typing');
    }, 3000);
  }, [socket, isConnected]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    socket.emit('chat:stop-typing');
  }, [socket, isConnected]);

  /**
   * Vote for track request
   */
  const voteForTrack = useCallback((requestId: number) => {
    if (!socket || !isConnected) return;
    
    socket.emit('track:vote', { requestId });
  }, [socket, isConnected]);

  /**
   * Request presence update
   */
  const requestPresence = useCallback(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('presence:request');
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    listenerCount,
    peakListeners,
    chatMessages,
    typingUsers,
    nowPlaying,
    sendMessage,
    startTyping,
    stopTyping,
    voteForTrack,
    requestPresence,
  };
}

/**
 * Hook specifically for chat functionality
 */
export function useChat(options: UseRealtimeOptions = {}) {
  const realtime = useRealtime(options);
  
  return {
    messages: realtime.chatMessages,
    typingUsers: realtime.typingUsers,
    sendMessage: realtime.sendMessage,
    startTyping: realtime.startTyping,
    stopTyping: realtime.stopTyping,
    isConnected: realtime.isConnected,
  };
}

/**
 * Hook for listener statistics
 */
export function useListenerStats() {
  const realtime = useRealtime();
  
  return {
    count: realtime.listenerCount,
    peak: realtime.peakListeners,
    isConnected: realtime.isConnected,
  };
}

/**
 * Hook for now playing updates
 */
export function useNowPlaying() {
  const realtime = useRealtime();
  
  return {
    nowPlaying: realtime.nowPlaying,
    isConnected: realtime.isConnected,
  };
}
