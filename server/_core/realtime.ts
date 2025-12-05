import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

let io: SocketIOServer | null = null;
let redisClient: Redis | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

interface UserPresence {
  userId: string;
  username: string;
  socketId: string;
  connectedAt: number;
  page?: string;
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

const activeSessions = new Map<string, UserPresence>();
const typingUsers = new Map<string, NodeJS.Timeout>();

/**
 * Initialize WebSocket server with Redis adapter for horizontal scaling
 */
export function initializeWebSocket(httpServer: HTTPServer) {
  if (io) {
    console.log('[WebSocket] Already initialized');
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Set up Redis adapter for multi-server support
  if (process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL);
      redisPub = redisClient.duplicate();
      redisSub = redisClient.duplicate();

      io.adapter(createAdapter(redisPub, redisSub));
      console.log('[WebSocket] Redis adapter configured for scaling');
    } catch (error) {
      console.warn('[WebSocket] Redis not available, running in single-server mode');
    }
  }

  // Connection handling
  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    handleConnection(socket);
    handleDisconnection(socket);
    handleChat(socket);
    handlePresence(socket);
    handleTrackRequests(socket);
    handleShouts(socket);
  });

  // Broadcast listener count every 5 seconds
  setInterval(() => {
    broadcastListenerCount();
  }, 5000);

  console.log('[WebSocket] Server initialized');
  return io;
}

/**
 * Handle new socket connection
 */
function handleConnection(socket: Socket) {
  socket.on('user:join', (data: { userId?: string; username: string; page?: string }) => {
    const presence: UserPresence = {
      userId: data.userId || `anon_${socket.id}`,
      username: data.username || 'Anonymous Listener',
      socketId: socket.id,
      connectedAt: Date.now(),
      page: data.page,
    };

    activeSessions.set(socket.id, presence);

    // Join user to their personal room
    if (data.userId) {
      socket.join(`user:${data.userId}`);
    }

    // Join the general listeners room
    socket.join('listeners');

    // Broadcast join event
    io?.to('listeners').emit('user:joined', {
      username: presence.username,
      listenerCount: activeSessions.size,
    });

    broadcastListenerCount();

    console.log(`[WebSocket] User joined: ${presence.username} (${activeSessions.size} online)`);
  });
}

/**
 * Handle socket disconnection
 */
function handleDisconnection(socket: Socket) {
  socket.on('disconnect', () => {
    const presence = activeSessions.get(socket.id);
    
    if (presence) {
      activeSessions.delete(socket.id);
      
      // Clear typing indicator if exists
      const typingTimer = typingUsers.get(socket.id);
      if (typingTimer) {
        clearTimeout(typingTimer);
        typingUsers.delete(socket.id);
      }

      // Broadcast leave event
      io?.to('listeners').emit('user:left', {
        username: presence.username,
        listenerCount: activeSessions.size,
      });

      broadcastListenerCount();

      console.log(`[WebSocket] User left: ${presence.username} (${activeSessions.size} online)`);
    }
  });
}

/**
 * Handle live chat messages
 */
function handleChat(socket: Socket) {
  // Send message
  socket.on('chat:message', (data: { message: string }) => {
    const presence = activeSessions.get(socket.id);
    if (!presence) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${socket.id}`,
      userId: presence.userId,
      username: presence.username,
      message: data.message.substring(0, 500), // Limit message length
      timestamp: Date.now(),
      type: 'message',
    };

    // Broadcast to all listeners
    io?.to('listeners').emit('chat:message', chatMessage);

    console.log(`[Chat] ${presence.username}: ${chatMessage.message}`);
  });

  // Typing indicator
  socket.on('chat:typing', () => {
    const presence = activeSessions.get(socket.id);
    if (!presence) return;

    // Clear existing timer
    const existingTimer = typingUsers.get(socket.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Broadcast typing
    socket.broadcast.to('listeners').emit('chat:typing', {
      userId: presence.userId,
      username: presence.username,
    });

    // Auto-clear after 3 seconds
    const timer = setTimeout(() => {
      typingUsers.delete(socket.id);
      socket.broadcast.to('listeners').emit('chat:stop-typing', {
        userId: presence.userId,
      });
    }, 3000);

    typingUsers.set(socket.id, timer);
  });

  // Stop typing
  socket.on('chat:stop-typing', () => {
    const presence = activeSessions.get(socket.id);
    if (!presence) return;

    const timer = typingUsers.get(socket.id);
    if (timer) {
      clearTimeout(timer);
      typingUsers.delete(socket.id);
    }

    socket.broadcast.to('listeners').emit('chat:stop-typing', {
      userId: presence.userId,
    });
  });
}

/**
 * Handle user presence
 */
function handlePresence(socket: Socket) {
  // Request current listener count
  socket.on('presence:request', () => {
    socket.emit('presence:update', {
      listenerCount: activeSessions.size,
      onlineUsers: Array.from(activeSessions.values()).map(u => ({
        username: u.username,
        page: u.page,
      })),
    });
  });
}

/**
 * Handle track requests with live voting
 */
function handleTrackRequests(socket: Socket) {
  // Vote for track request
  socket.on('track:vote', (data: { requestId: number }) => {
    // Broadcast vote update to all listeners
    io?.to('listeners').emit('track:vote-update', {
      requestId: data.requestId,
      voterId: socket.id,
    });
  });

  // New track request
  socket.on('track:new-request', (data: { title: string; artist: string; requesterId: string }) => {
    io?.to('listeners').emit('track:new-request', {
      ...data,
      timestamp: Date.now(),
    });
  });
}

/**
 * Handle shout submissions
 */
function handleShouts(socket: Socket) {
  socket.on('shout:new', (data: { name: string; message: string }) => {
    // Broadcast new shout to admins
    io?.to('admin').emit('shout:new', {
      ...data,
      timestamp: Date.now(),
      from: socket.id,
    });
  });
}

/**
 * Broadcast now playing update
 */
export function broadcastNowPlaying(data: NowPlayingData) {
  if (!io) return;

  io.to('listeners').emit('nowplaying:update', data);
  
  console.log(`[WebSocket] Broadcasting now playing: ${data.artist} - ${data.title}`);
}

/**
 * Broadcast listener count
 */
export function broadcastListenerCount() {
  if (!io) return;

  const count = activeSessions.size;
  
  io.to('listeners').emit('listeners:count', {
    count,
    peak: Math.max(count, getPeakListeners()),
  });
}

/**
 * Send notification to specific user
 */
export function sendUserNotification(userId: string, notification: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification', notification);
}

/**
 * Broadcast system message
 */
export function broadcastSystemMessage(message: string) {
  if (!io) return;

  const systemMessage: ChatMessage = {
    id: `sys_${Date.now()}`,
    userId: 'system',
    username: 'Hectic Radio',
    message,
    timestamp: Date.now(),
    type: 'system',
  };

  io.to('listeners').emit('chat:message', systemMessage);
}

/**
 * Send admin notification
 */
export function sendAdminNotification(notification: any) {
  if (!io) return;

  io.to('admin').emit('admin:notification', notification);
}

/**
 * Get current listener count
 */
export function getListenerCount(): number {
  return activeSessions.size;
}

/**
 * Get peak listeners (stored in Redis or memory)
 */
function getPeakListeners(): number {
  // TODO: Implement Redis-backed peak tracking
  return activeSessions.size;
}

/**
 * Get WebSocket server instance
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Cleanup on server shutdown
 */
export async function cleanupWebSocket() {
  if (io) {
    io.close();
  }
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  if (redisPub) {
    await redisPub.quit();
  }
  
  if (redisSub) {
    await redisSub.quit();
  }

  activeSessions.clear();
  typingUsers.forEach(timer => clearTimeout(timer));
  typingUsers.clear();
}

// Export types
export type {
  UserPresence,
  ChatMessage,
  NowPlayingData,
};
