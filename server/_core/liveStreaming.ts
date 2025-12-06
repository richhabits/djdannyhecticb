import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { nanoid } from 'nanoid';

interface LiveStream {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  startedAt: number;
  viewers: Set<string>;
  isRecording: boolean;
  recordingUrl?: string;
}

interface StreamPeer {
  id: string;
  userId: string;
  role: 'host' | 'viewer';
  stream?: MediaStream;
}

const activeStreams = new Map<string, LiveStream>();
const streamPeers = new Map<string, Map<string, StreamPeer>>();

/**
 * Initialize live streaming with WebRTC signaling
 */
export function initializeLiveStreaming(io: SocketIOServer) {
  const streamingNamespace = io.of('/streaming');

  streamingNamespace.on('connection', (socket) => {
    console.log(`[Streaming] Client connected: ${socket.id}`);

    // Start stream (host only)
    socket.on('stream:start', (data: { title: string; description?: string; userId: string }) => {
      const streamId = nanoid();
      
      const stream: LiveStream = {
        id: streamId,
        hostId: data.userId,
        title: data.title,
        description: data.description,
        startedAt: Date.now(),
        viewers: new Set(),
        isRecording: false,
      };

      activeStreams.set(streamId, stream);
      streamPeers.set(streamId, new Map());

      socket.join(`stream:${streamId}`);
      
      socket.emit('stream:started', {
        streamId,
        stream,
      });

      // Broadcast to all that a new stream is live
      io.emit('stream:new', {
        streamId,
        title: stream.title,
        hostId: stream.hostId,
      });

      console.log(`[Streaming] Stream started: ${streamId} by ${data.userId}`);
    });

    // Join stream (viewer)
    socket.on('stream:join', (data: { streamId: string; userId: string }) => {
      const stream = activeStreams.get(data.streamId);
      
      if (!stream) {
        socket.emit('stream:error', { message: 'Stream not found' });
        return;
      }

      stream.viewers.add(data.userId);
      socket.join(`stream:${data.streamId}`);

      const peer: StreamPeer = {
        id: socket.id,
        userId: data.userId,
        role: 'viewer',
      };

      const peers = streamPeers.get(data.streamId);
      if (peers) {
        peers.set(socket.id, peer);
      }

      socket.emit('stream:joined', {
        streamId: data.streamId,
        stream,
        viewerCount: stream.viewers.size,
      });

      // Notify others
      socket.to(`stream:${data.streamId}`).emit('stream:viewer-joined', {
        userId: data.userId,
        viewerCount: stream.viewers.size,
      });

      console.log(`[Streaming] User ${data.userId} joined stream ${data.streamId}`);
    });

    // WebRTC signaling - Offer
    socket.on('webrtc:offer', (data: { streamId: string; offer: RTCSessionDescriptionInit; to: string }) => {
      socket.to(data.to).emit('webrtc:offer', {
        offer: data.offer,
        from: socket.id,
      });
    });

    // WebRTC signaling - Answer
    socket.on('webrtc:answer', (data: { streamId: string; answer: RTCSessionDescriptionInit; to: string }) => {
      socket.to(data.to).emit('webrtc:answer', {
        answer: data.answer,
        from: socket.id,
      });
    });

    // WebRTC signaling - ICE Candidate
    socket.on('webrtc:ice-candidate', (data: { streamId: string; candidate: RTCIceCandidateInit; to: string }) => {
      socket.to(data.to).emit('webrtc:ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    // Send chat message in stream
    socket.on('stream:chat', (data: { streamId: string; message: string; userId: string; username: string }) => {
      streamingNamespace.to(`stream:${data.streamId}`).emit('stream:chat', {
        id: nanoid(),
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: Date.now(),
      });
    });

    // Send reaction (emoji)
    socket.on('stream:reaction', (data: { streamId: string; emoji: string }) => {
      streamingNamespace.to(`stream:${data.streamId}`).emit('stream:reaction', {
        emoji: data.emoji,
        x: Math.random() * 100, // Random position
        y: Math.random() * 100,
      });
    });

    // End stream (host only)
    socket.on('stream:end', (data: { streamId: string }) => {
      const stream = activeStreams.get(data.streamId);
      
      if (!stream) return;

      // Notify all viewers
      streamingNamespace.to(`stream:${data.streamId}`).emit('stream:ended', {
        streamId: data.streamId,
        duration: Date.now() - stream.startedAt,
      });

      // Cleanup
      activeStreams.delete(data.streamId);
      streamPeers.delete(data.streamId);

      console.log(`[Streaming] Stream ended: ${data.streamId}`);
    });

    // Leave stream
    socket.on('stream:leave', (data: { streamId: string; userId: string }) => {
      const stream = activeStreams.get(data.streamId);
      
      if (stream) {
        stream.viewers.delete(data.userId);
        
        socket.to(`stream:${data.streamId}`).emit('stream:viewer-left', {
          userId: data.userId,
          viewerCount: stream.viewers.size,
        });
      }

      const peers = streamPeers.get(data.streamId);
      if (peers) {
        peers.delete(socket.id);
      }

      socket.leave(`stream:${data.streamId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Clean up any streams this socket was part of
      for (const [streamId, peers] of streamPeers.entries()) {
        if (peers.has(socket.id)) {
          const peer = peers.get(socket.id);
          const stream = activeStreams.get(streamId);
          
          if (stream && peer) {
            stream.viewers.delete(peer.userId);
            
            streamingNamespace.to(`stream:${streamId}`).emit('stream:viewer-left', {
              userId: peer.userId,
              viewerCount: stream.viewers.size,
            });
          }
          
          peers.delete(socket.id);
        }
      }
    });
  });

  console.log('[Streaming] Live streaming initialized');
}

/**
 * Get active streams
 */
export function getActiveStreams(): LiveStream[] {
  return Array.from(activeStreams.values()).map(stream => ({
    ...stream,
    viewers: new Set(stream.viewers), // Clone the set
  }));
}

/**
 * Get stream by ID
 */
export function getStream(streamId: string): LiveStream | null {
  return activeStreams.get(streamId) || null;
}

/**
 * Get viewer count for stream
 */
export function getViewerCount(streamId: string): number {
  const stream = activeStreams.get(streamId);
  return stream ? stream.viewers.size : 0;
}

/**
 * Start recording stream
 */
export function startRecording(streamId: string): boolean {
  const stream = activeStreams.get(streamId);
  
  if (!stream) return false;
  
  stream.isRecording = true;
  console.log(`[Streaming] Recording started for stream ${streamId}`);
  return true;
}

/**
 * Stop recording and save
 */
export function stopRecording(streamId: string, recordingUrl: string): boolean {
  const stream = activeStreams.get(streamId);
  
  if (!stream) return false;
  
  stream.isRecording = false;
  stream.recordingUrl = recordingUrl;
  console.log(`[Streaming] Recording saved for stream ${streamId}: ${recordingUrl}`);
  return true;
}

export type { LiveStream, StreamPeer };
