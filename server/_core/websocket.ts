import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { PubSub } from './cache';
import { db } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Enterprise WebSocket Implementation with Socket.IO
 * Handles real-time updates, notifications, and live features
 */

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  sessionId?: string;
}

interface LiveStreamData {
  streamId: string;
  platform: string;
  viewerCount: number;
  isLive: boolean;
  streamUrl?: string;
  chatEnabled?: boolean;
}

interface NotificationData {
  id: string;
  type: 'booking' | 'message' | 'event' | 'system' | 'payment';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  data?: any;
}

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  roomId: string;
  type: 'text' | 'emoji' | 'image' | 'system';
  metadata?: any;
}

interface PresenceData {
  userId: number;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  location?: string;
}

class WebSocketManager {
  private io: SocketIOServer;
  private connections: Map<string, AuthenticatedSocket> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private presenceTracking: Map<number, PresenceData> = new Map();
  private streamingSessions: Map<string, LiveStreamData> = new Map();
  private rateLimiter: Map<string, number> = new Map();
  
  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://djdannyhectib.com', 'https://www.djdannyhectib.com']
          : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e7, // 10MB
    });

    this.initialize();
    this.setupPubSubListeners();
    this.startMetricsCollection();
  }

  /**
   * Initialize WebSocket server and middleware
   */
  private initialize() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        
        // Get user from database
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.sessionId = decoded.sessionId;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const connectionId = socket.id;
    
    console.log(`👤 User ${userId} connected (${connectionId})`);
    
    // Store connection
    this.connections.set(connectionId, socket);
    
    // Update presence
    this.updatePresence(userId, 'online');
    
    // Join user's personal room
    socket.join(`user:${userId}`);
    
    // Send initial data
    this.sendInitialData(socket);
    
    // Register event handlers
    this.registerEventHandlers(socket);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👤 User ${userId} disconnected (${connectionId})`);
      this.connections.delete(connectionId);
      this.updatePresence(userId, 'offline');
      this.cleanupUserRooms(socket);
    });
  }

  /**
   * Send initial data to newly connected client
   */
  private async sendInitialData(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    
    // Send pending notifications
    const notifications = await this.getPendingNotifications(userId);
    socket.emit('notifications:initial', notifications);
    
    // Send online users
    const onlineUsers = Array.from(this.presenceTracking.entries())
      .filter(([_, data]) => data.status === 'online')
      .map(([id, data]) => ({ userId: id, ...data }));
    socket.emit('presence:online', onlineUsers);
    
    // Send active streams
    const activeStreams = Array.from(this.streamingSessions.values())
      .filter(stream => stream.isLive);
    socket.emit('streams:active', activeStreams);
  }

  /**
   * Register socket event handlers
   */
  private registerEventHandlers(socket: AuthenticatedSocket) {
    // Chat events
    socket.on('chat:join', (roomId: string) => this.handleJoinRoom(socket, roomId));
    socket.on('chat:leave', (roomId: string) => this.handleLeaveRoom(socket, roomId));
    socket.on('chat:message', (data: any) => this.handleChatMessage(socket, data));
    socket.on('chat:typing', (roomId: string) => this.handleTyping(socket, roomId, true));
    socket.on('chat:stopTyping', (roomId: string) => this.handleTyping(socket, roomId, false));
    
    // Streaming events
    socket.on('stream:start', (data: LiveStreamData) => this.handleStreamStart(socket, data));
    socket.on('stream:update', (data: Partial<LiveStreamData>) => this.handleStreamUpdate(socket, data));
    socket.on('stream:end', (streamId: string) => this.handleStreamEnd(socket, streamId));
    socket.on('stream:viewerJoin', (streamId: string) => this.handleStreamViewerJoin(socket, streamId));
    socket.on('stream:viewerLeave', (streamId: string) => this.handleStreamViewerLeave(socket, streamId));
    
    // Booking events
    socket.on('booking:track', (bookingId: string) => this.handleBookingTracking(socket, bookingId));
    socket.on('booking:update', (data: any) => this.handleBookingUpdate(socket, data));
    
    // Presence events
    socket.on('presence:update', (status: string) => this.handlePresenceUpdate(socket, status));
    socket.on('presence:heartbeat', () => this.handleHeartbeat(socket));
    
    // Notification events
    socket.on('notification:read', (notificationId: string) => this.handleNotificationRead(socket, notificationId));
    socket.on('notification:readAll', () => this.handleNotificationReadAll(socket));
    
    // Collaboration events
    socket.on('collab:cursor', (data: any) => this.handleCollaborativeCursor(socket, data));
    socket.on('collab:select', (data: any) => this.handleCollaborativeSelect(socket, data));
    
    // Analytics events
    socket.on('analytics:track', (event: any) => this.handleAnalyticsEvent(socket, event));
    socket.on('analytics:pageView', (page: string) => this.handlePageView(socket, page));
    
    // Admin events (restricted to admin role)
    if (socket.userRole === 'admin') {
      socket.on('admin:broadcast', (message: any) => this.handleAdminBroadcast(socket, message));
      socket.on('admin:kickUser', (userId: number) => this.handleKickUser(socket, userId));
      socket.on('admin:metrics', () => this.handleGetMetrics(socket));
    }
  }

  /**
   * Chat room management
   */
  private handleJoinRoom(socket: AuthenticatedSocket, roomId: string) {
    // Rate limiting
    if (!this.checkRateLimit(socket.id, 'join', 10)) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      return;
    }
    
    socket.join(roomId);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socket.id);
    
    // Notify room members
    socket.to(roomId).emit('chat:userJoined', {
      userId: socket.userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
    
    // Send room history
    this.sendRoomHistory(socket, roomId);
  }

  private handleLeaveRoom(socket: AuthenticatedSocket, roomId: string) {
    socket.leave(roomId);
    
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(socket.id);
      
      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    // Notify room members
    socket.to(roomId).emit('chat:userLeft', {
      userId: socket.userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    // Rate limiting
    if (!this.checkRateLimit(socket.id, 'message', 30)) {
      socket.emit('error', { message: 'Too many messages. Please slow down.' });
      return;
    }
    
    // Validate and sanitize message
    const message = this.sanitizeMessage(data.message);
    if (!message || message.length > 1000) {
      socket.emit('error', { message: 'Invalid message' });
      return;
    }
    
    const chatMessage: ChatMessage = {
      id: this.generateId(),
      userId: socket.userId!,
      username: data.username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
      roomId: data.roomId,
      type: data.type || 'text',
      metadata: data.metadata,
    };
    
    // Store message in database
    await this.storeChatMessage(chatMessage);
    
    // Broadcast to room
    this.io.to(data.roomId).emit('chat:message', chatMessage);
    
    // Send push notification to offline users
    this.sendPushNotificationToOfflineUsers(data.roomId, chatMessage);
  }

  private handleTyping(socket: AuthenticatedSocket, roomId: string, isTyping: boolean) {
    socket.to(roomId).emit('chat:typing', {
      userId: socket.userId,
      isTyping,
      roomId,
    });
  }

  /**
   * Live streaming management
   */
  private async handleStreamStart(socket: AuthenticatedSocket, data: LiveStreamData) {
    if (socket.userRole !== 'admin') {
      socket.emit('error', { message: 'Unauthorized to start stream' });
      return;
    }
    
    const streamId = data.streamId || this.generateId();
    
    this.streamingSessions.set(streamId, {
      ...data,
      streamId,
      isLive: true,
      viewerCount: 0,
    });
    
    // Notify all connected clients
    this.io.emit('stream:started', {
      streamId,
      platform: data.platform,
      streamUrl: data.streamUrl,
      timestamp: new Date().toISOString(),
    });
    
    // Send push notifications
    this.sendStreamNotifications(streamId, 'DJ Danny is now live!');
    
    // Log to analytics
    PubSub.publish('analytics:stream', {
      event: 'stream_start',
      streamId,
      platform: data.platform,
      timestamp: new Date().toISOString(),
    });
  }

  private handleStreamUpdate(socket: AuthenticatedSocket, data: Partial<LiveStreamData>) {
    if (!data.streamId || !this.streamingSessions.has(data.streamId)) {
      socket.emit('error', { message: 'Stream not found' });
      return;
    }
    
    const stream = this.streamingSessions.get(data.streamId)!;
    Object.assign(stream, data);
    
    // Broadcast updates to viewers
    this.io.to(`stream:${data.streamId}`).emit('stream:updated', data);
  }

  private handleStreamEnd(socket: AuthenticatedSocket, streamId: string) {
    if (socket.userRole !== 'admin') {
      socket.emit('error', { message: 'Unauthorized to end stream' });
      return;
    }
    
    const stream = this.streamingSessions.get(streamId);
    if (!stream) {
      socket.emit('error', { message: 'Stream not found' });
      return;
    }
    
    stream.isLive = false;
    
    // Notify viewers
    this.io.to(`stream:${streamId}`).emit('stream:ended', {
      streamId,
      timestamp: new Date().toISOString(),
    });
    
    // Clean up
    setTimeout(() => {
      this.streamingSessions.delete(streamId);
    }, 60000); // Keep for 1 minute for late joiners
    
    // Log analytics
    PubSub.publish('analytics:stream', {
      event: 'stream_end',
      streamId,
      duration: Date.now() - new Date(stream.timestamp).getTime(),
      maxViewers: stream.viewerCount,
      timestamp: new Date().toISOString(),
    });
  }

  private handleStreamViewerJoin(socket: AuthenticatedSocket, streamId: string) {
    const stream = this.streamingSessions.get(streamId);
    if (!stream) {
      socket.emit('error', { message: 'Stream not found' });
      return;
    }
    
    socket.join(`stream:${streamId}`);
    stream.viewerCount++;
    
    // Send current stream data
    socket.emit('stream:data', stream);
    
    // Broadcast viewer count update
    this.io.to(`stream:${streamId}`).emit('stream:viewerCount', {
      streamId,
      count: stream.viewerCount,
    });
  }

  private handleStreamViewerLeave(socket: AuthenticatedSocket, streamId: string) {
    const stream = this.streamingSessions.get(streamId);
    if (!stream) return;
    
    socket.leave(`stream:${streamId}`);
    stream.viewerCount = Math.max(0, stream.viewerCount - 1);
    
    // Broadcast viewer count update
    this.io.to(`stream:${streamId}`).emit('stream:viewerCount', {
      streamId,
      count: stream.viewerCount,
    });
  }

  /**
   * Booking real-time tracking
   */
  private async handleBookingTracking(socket: AuthenticatedSocket, bookingId: string) {
    socket.join(`booking:${bookingId}`);
    
    // Send current booking status
    const bookingStatus = await this.getBookingStatus(bookingId);
    socket.emit('booking:status', bookingStatus);
  }

  private async handleBookingUpdate(socket: AuthenticatedSocket, data: any) {
    const { bookingId, status, message } = data;
    
    // Verify permission to update booking
    const hasPermission = await this.verifyBookingPermission(socket.userId!, bookingId);
    if (!hasPermission) {
      socket.emit('error', { message: 'Unauthorized to update booking' });
      return;
    }
    
    // Broadcast update to all tracking this booking
    this.io.to(`booking:${bookingId}`).emit('booking:updated', {
      bookingId,
      status,
      message,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });
    
    // Send notification to booking owner
    const booking = await this.getBooking(bookingId);
    if (booking) {
      this.sendNotification(booking.userId, {
        id: this.generateId(),
        type: 'booking',
        title: 'Booking Updated',
        message: `Your booking #${bookingId} status: ${status}`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        data: { bookingId, status },
      });
    }
  }

  /**
   * Presence management
   */
  private updatePresence(userId: number, status: string) {
    this.presenceTracking.set(userId, {
      userId,
      status: status as any,
      lastSeen: new Date().toISOString(),
    });
    
    // Broadcast presence update
    this.io.emit('presence:update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  private handlePresenceUpdate(socket: AuthenticatedSocket, status: string) {
    this.updatePresence(socket.userId!, status);
  }

  private handleHeartbeat(socket: AuthenticatedSocket) {
    this.updatePresence(socket.userId!, 'online');
    socket.emit('heartbeat:ack', { timestamp: new Date().toISOString() });
  }

  /**
   * Notification management
   */
  private async handleNotificationRead(socket: AuthenticatedSocket, notificationId: string) {
    await this.markNotificationAsRead(socket.userId!, notificationId);
    socket.emit('notification:marked', { notificationId, read: true });
  }

  private async handleNotificationReadAll(socket: AuthenticatedSocket) {
    await this.markAllNotificationsAsRead(socket.userId!);
    socket.emit('notification:markedAll', { read: true });
  }

  public sendNotification(userId: number, notification: NotificationData) {
    const userSockets = this.getUserSockets(userId);
    
    userSockets.forEach(socket => {
      socket.emit('notification:new', notification);
    });
    
    // Store notification for offline users
    this.storeNotification(userId, notification);
  }

  public broadcastNotification(notification: NotificationData) {
    this.io.emit('notification:broadcast', notification);
  }

  /**
   * Collaborative features
   */
  private handleCollaborativeCursor(socket: AuthenticatedSocket, data: any) {
    socket.to(data.roomId).emit('collab:cursor', {
      userId: socket.userId,
      ...data,
    });
  }

  private handleCollaborativeSelect(socket: AuthenticatedSocket, data: any) {
    socket.to(data.roomId).emit('collab:select', {
      userId: socket.userId,
      ...data,
    });
  }

  /**
   * Analytics tracking
   */
  private handleAnalyticsEvent(socket: AuthenticatedSocket, event: any) {
    PubSub.publish('analytics:event', {
      userId: socket.userId,
      sessionId: socket.sessionId,
      ...event,
      timestamp: new Date().toISOString(),
    });
  }

  private handlePageView(socket: AuthenticatedSocket, page: string) {
    PubSub.publish('analytics:pageview', {
      userId: socket.userId,
      sessionId: socket.sessionId,
      page,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Admin functions
   */
  private handleAdminBroadcast(socket: AuthenticatedSocket, message: any) {
    this.broadcastNotification({
      id: this.generateId(),
      type: 'system',
      title: 'System Message',
      message: message.content,
      priority: message.priority || 'medium',
      timestamp: new Date().toISOString(),
    });
  }

  private handleKickUser(socket: AuthenticatedSocket, userId: number) {
    const userSockets = this.getUserSockets(userId);
    
    userSockets.forEach(s => {
      s.emit('kicked', { reason: 'Kicked by administrator' });
      s.disconnect();
    });
  }

  private handleGetMetrics(socket: AuthenticatedSocket) {
    const metrics = {
      totalConnections: this.connections.size,
      onlineUsers: Array.from(this.presenceTracking.values()).filter(p => p.status === 'online').length,
      activeRooms: this.rooms.size,
      activeStreams: Array.from(this.streamingSessions.values()).filter(s => s.isLive).length,
      timestamp: new Date().toISOString(),
    };
    
    socket.emit('admin:metrics', metrics);
  }

  /**
   * PubSub listeners for external events
   */
  private setupPubSubListeners() {
    // Listen for booking updates from the application
    PubSub.subscribe('booking:updated', (data) => {
      this.io.to(`booking:${data.bookingId}`).emit('booking:updated', data);
    });
    
    // Listen for new content notifications
    PubSub.subscribe('content:new', (data) => {
      this.io.emit('content:new', data);
    });
    
    // Listen for system alerts
    PubSub.subscribe('system:alert', (data) => {
      this.broadcastNotification({
        id: this.generateId(),
        type: 'system',
        title: 'System Alert',
        message: data.message,
        priority: data.priority || 'high',
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Metrics collection
   */
  private startMetricsCollection() {
    setInterval(() => {
      const metrics = {
        connections: this.connections.size,
        rooms: this.rooms.size,
        streams: this.streamingSessions.size,
        onlineUsers: Array.from(this.presenceTracking.values()).filter(p => p.status === 'online').length,
      };
      
      PubSub.publish('metrics:websocket', metrics);
    }, 60000); // Every minute
  }

  /**
   * Helper functions
   */
  private getUserSockets(userId: number): AuthenticatedSocket[] {
    return Array.from(this.connections.values()).filter(s => s.userId === userId);
  }

  private cleanupUserRooms(socket: AuthenticatedSocket) {
    this.rooms.forEach((sockets, roomId) => {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        this.rooms.delete(roomId);
      }
    });
  }

  private checkRateLimit(socketId: string, action: string, maxPerMinute: number): boolean {
    const key = `${socketId}:${action}`;
    const now = Date.now();
    const count = this.rateLimiter.get(key) || 0;
    
    if (count >= maxPerMinute) {
      return false;
    }
    
    this.rateLimiter.set(key, count + 1);
    
    // Reset after 1 minute
    setTimeout(() => {
      this.rateLimiter.delete(key);
    }, 60000);
    
    return true;
  }

  private sanitizeMessage(message: string): string {
    if (!message) return '';
    
    // Remove HTML tags
    message = message.replace(/<[^>]*>/g, '');
    
    // Trim and limit length
    message = message.trim().substring(0, 1000);
    
    return message;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Database helper functions (implement based on your schema)
  private async getPendingNotifications(userId: number): Promise<NotificationData[]> {
    // Implement database query
    return [];
  }

  private async storeChatMessage(message: ChatMessage): Promise<void> {
    // Implement database storage
  }

  private async sendRoomHistory(socket: AuthenticatedSocket, roomId: string): Promise<void> {
    // Implement room history retrieval
  }

  private async getBookingStatus(bookingId: string): Promise<any> {
    // Implement booking status retrieval
    return {};
  }

  private async verifyBookingPermission(userId: number, bookingId: string): Promise<boolean> {
    // Implement permission check
    return true;
  }

  private async getBooking(bookingId: string): Promise<any> {
    // Implement booking retrieval
    return null;
  }

  private async markNotificationAsRead(userId: number, notificationId: string): Promise<void> {
    // Implement notification marking
  }

  private async markAllNotificationsAsRead(userId: number): Promise<void> {
    // Implement bulk notification marking
  }

  private async storeNotification(userId: number, notification: NotificationData): Promise<void> {
    // Implement notification storage
  }

  private sendPushNotificationToOfflineUsers(roomId: string, message: ChatMessage): void {
    // Implement push notifications
  }

  private sendStreamNotifications(streamId: string, message: string): void {
    // Implement stream notifications
  }
}

// Export singleton instance
export let websocketManager: WebSocketManager;

export function initializeWebSocket(server: HTTPServer) {
  websocketManager = new WebSocketManager(server);
  return websocketManager;
}