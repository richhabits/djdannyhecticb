# WebSocket Real-Time Chat - Quick Start Guide

## 30-Second Setup

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run the test client:**
   ```bash
   npx tsx server/test/websocket-test-client.ts
   ```

3. **See real-time chat and reactions in action!**

## Basic Client Usage

### Connect to WebSocket
```typescript
const ws = new WebSocket(
  'ws://localhost:3000/ws/live?session=1&userId=123'
);

ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log('Received:', msg);
};
```

### Send Chat Message
```typescript
ws.send(JSON.stringify({
  type: 'chat',
  data: {
    message: 'Hello everyone!',
    color: '#FF0000' // optional
  }
}));
```

### Send Reaction
```typescript
ws.send(JSON.stringify({
  type: 'reaction',
  data: {
    reactionType: 'fire' // or: love, hype, laugh, sad, angry, thinking
  }
}));
```

### Keep Connection Alive
```typescript
// Send ping every 30 seconds
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping', data: {} }));
}, 30000);
```

## Message Types from Server

### When you receive a chat message:
```json
{
  "type": "chat_message",
  "data": {
    "id": 1,
    "userId": 123,
    "message": "Hello everyone!",
    "usernameColor": "#FF0000",
    "createdAt": "2026-05-01T12:00:00Z"
  }
}
```

### When you receive a reaction:
```json
{
  "type": "reaction",
  "data": {
    "userId": 456,
    "reactionType": "fire",
    "combo": {
      "isCombo": true,
      "streakCount": 3
    }
  }
}
```

### When users join/leave:
```json
{
  "type": "user_joined",
  "data": {
    "userId": 789,
    "username": "user789",
    "activeUsers": 42
  }
}
```

### Error messages:
```json
{
  "type": "chat_error",
  "data": {
    "error": "Message rate limit exceeded. Please wait before sending again."
  }
}
```

## Valid Reaction Types

Use exactly one of these:
- `fire` 🔥
- `love` ❤️
- `hype` 🎉
- `laugh` 😂
- `sad` 😢
- `angry` 😠
- `thinking` 🤔

## Rate Limits to Know

### Chat Messages
- Minimum 500ms between messages
- Max 5 messages per 5-second window
- Max 500 characters per message
- Min 1 character per message

### Reactions
- Minimum 1 second between reactions
- Combo triggers after 3 reactions of same type in 3 seconds
- Unlimited reaction types (within cooldown)

## Running the Test Client

The test client simulates multiple concurrent users:

```bash
npx tsx server/test/websocket-test-client.ts
```

It will:
- Connect 3 users
- Send random chat messages
- Send random reactions
- Measure latency
- Report delivery rates

Expected output:
```
Starting WebSocket test with 3 concurrent users...
Connected 3 clients
[User 1] Connected
[User 2] Connected
[User 3] Connected

=== Test Results ===

Overall Statistics:
  Total Messages Sent: 45
  Total Messages Received: 42
  Message Delivery Rate: 93.3%
  Total Reactions Sent: 63
  Total Reactions Received: 63
  Total Errors: 0
  Total Rate Limit Hits: 2
```

## Common Issues

### "Missing required parameters"
Make sure your WebSocket URL includes session and userId:
```typescript
// ❌ Wrong
ws://localhost:3000/ws/live

// ✓ Correct
ws://localhost:3000/ws/live?session=1&userId=123
```

### "Message rate limit exceeded"
Your message sent too quickly. Wait at least 500ms between messages:
```typescript
// Better approach
const [lastSendTime, setLastSendTime] = useState(0);

const sendMessage = (msg) => {
  const now = Date.now();
  if (now - lastSendTime < 500) return; // Wait
  ws.send(JSON.stringify({ type: 'chat', data: { message: msg } }));
  setLastSendTime(now);
};
```

### Connection closes immediately
- Check if server is running (`npm run dev`)
- Verify port 3000 is not blocked
- Check browser console for CORS errors

### Messages not appearing for others
- WebSocket must be in OPEN state (readyState === 1)
- Server must have database connection
- Check console logs for database errors

## Environment Variables

No special environment variables needed. Uses existing database connection.

## File Locations

Key implementation files:
- `server/features/liveChat.ts` - Chat validation & rate limiting
- `server/features/reactions.ts` - Reaction handling
- `server/features/eventBroadcaster.ts` - Event system
- `server/routers/liveWebSocket.ts` - WebSocket server
- `server/test/websocket-test-client.ts` - Test client
- `docs/WEBSOCKET_REAL_TIME_CHAT.md` - Full documentation

## Next: Integrate into Your UI

### React Hook for WebSocket
```typescript
import { useEffect, useRef, useState } from 'react';

export function useLiveChat(sessionId, userId) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:3000/ws/live?session=${sessionId}&userId=${userId}`
    );

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'chat_message') {
        setMessages(prev => [...prev, msg.data]);
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [sessionId, userId]);

  const sendMessage = (text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        data: { message: text, color: '#FF0000' }
      }));
    }
  };

  const sendReaction = (type) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'reaction',
        data: { reactionType: type }
      }));
    }
  };

  return { messages, connected, sendMessage, sendReaction };
}
```

## Full Documentation

See `docs/WEBSOCKET_REAL_TIME_CHAT.md` for:
- Complete message format reference
- Database schema
- tRPC API endpoints
- Security considerations
- Performance optimization
- Troubleshooting guide
- Integration examples

## Support

- Check console logs for errors
- Run test client to verify server
- Review documentation in `/docs`
- Check existing implementation in `/server`

Happy building! 🚀
