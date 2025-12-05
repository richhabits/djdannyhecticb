/**
 * WebSocket Server for Real-time Features
 * Handles live updates, chat, and real-time notifications
 */

import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join room based on user ID if authenticated
    socket.on("join:user", (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`[WebSocket] User ${userId} joined their room`);
    });

    // Join live stream room
    socket.on("join:stream", () => {
      socket.join("live-stream");
      console.log(`[WebSocket] Client joined live stream room`);
    });

    // Join chat room
    socket.on("join:chat", () => {
      socket.join("chat");
      console.log(`[WebSocket] Client joined chat room`);
    });

    // Handle chat messages
    socket.on("chat:message", (data: { message: string; userId?: number }) => {
      io?.to("chat").emit("chat:message", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[WebSocket] Server initialized");
  return io;
}

/**
 * Broadcast to all clients
 */
export function broadcast(event: string, data: any) {
  io?.emit(event, data);
}

/**
 * Broadcast to a specific room
 */
export function broadcastToRoom(room: string, event: string, data: any) {
  io?.to(room).emit(event, data);
}

/**
 * Send to a specific user
 */
export function sendToUser(userId: number, event: string, data: any) {
  io?.to(`user:${userId}`).emit(event, data);
}

/**
 * Get connected clients count
 */
export function getConnectedCount(): number {
  return io?.sockets.sockets.size || 0;
}

export { io };
