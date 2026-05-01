import { Router, Response } from "express";
import { WebSocket, WebSocketServer } from "ws";

const router = Router();

interface StreamClient {
  ws: WebSocket;
  userId?: string;
}

const clients = new Set<StreamClient>();

export function setupStreamWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: any, socket: any, head: any) => {
    if (request.url === "/ws/stream") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        const client: StreamClient = { ws };
        clients.add(client);

        console.log(`Stream client connected. Total: ${clients.size}`);

        ws.on("close", () => {
          clients.delete(client);
          console.log(`Stream client disconnected. Total: ${clients.size}`);
        });

        ws.on("error", (error) => {
          console.error("Stream WebSocket error:", error);
          clients.delete(client);
        });
      });
    }
  });

  return wss;
}

export function broadcastStreamEvent(event: {
  id: string;
  type: "follow" | "subscribe" | "donation" | "raid";
  username: string;
  timestamp: Date;
  [key: string]: any;
}) {
  const message = JSON.stringify(event);
  const deadClients: StreamClient[] = [];

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    } else {
      deadClients.push(client);
    }
  });

  deadClients.forEach((client) => clients.delete(client));
}

// API endpoints for testing/triggering events
router.post("/api/stream/event/donation", (req, res) => {
  const { username, amount, message } = req.body;

  if (!username || !amount) {
    return res.status(400).json({ error: "Missing username or amount" });
  }

  broadcastStreamEvent({
    id: `donation_${Date.now()}`,
    type: "donation",
    username,
    amount,
    message: message || "",
    timestamp: new Date(),
  });

  res.json({ success: true });
});

router.post("/api/stream/event/raid", (req, res) => {
  const { username, raidCount } = req.body;

  if (!username || !raidCount) {
    return res.status(400).json({ error: "Missing username or raidCount" });
  }

  broadcastStreamEvent({
    id: `raid_${Date.now()}`,
    type: "raid",
    username,
    raidCount,
    timestamp: new Date(),
  });

  res.json({ success: true });
});

router.post("/api/stream/event/subscribe", (req, res) => {
  const { username, tier = "gold", months = 1, message } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  broadcastStreamEvent({
    id: `subscribe_${Date.now()}`,
    type: "subscribe",
    username,
    tier,
    months,
    message: message || "",
    timestamp: new Date(),
  });

  res.json({ success: true });
});

router.post("/api/stream/event/follow", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  broadcastStreamEvent({
    id: `follow_${Date.now()}`,
    type: "follow",
    username,
    timestamp: new Date(),
  });

  res.json({ success: true });
});

export default router;
