import { useEffect, useCallback, useRef } from "react";

export interface StreamEvent {
  id: string;
  type: "follow" | "subscribe" | "donation" | "raid";
  username: string;
  timestamp: Date;
  amount?: number;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  months?: number;
  message?: string;
  raidCount?: number;
}

interface StreamEventHandlers {
  onDonation?: (donor: string, amount: number, message?: string) => void;
  onRaid?: (raiderName: string, raidCount: number) => void;
  onSubscribe?: (username: string, tier: string, months: number, message?: string) => void;
  onFollow?: (username: string) => void;
}

export function useStreamEvents(handlers: StreamEventHandlers) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/stream`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ Stream events connected");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StreamEvent;

          switch (data.type) {
            case "donation":
              handlers.onDonation?.(data.username, data.amount || 0, data.message);
              break;
            case "raid":
              handlers.onRaid?.(data.username, data.raidCount || 0);
              break;
            case "subscribe":
              handlers.onSubscribe?.(
                data.username,
                data.tier || "gold",
                data.months || 1,
                data.message
              );
              break;
            case "follow":
              handlers.onFollow?.(data.username);
              break;
          }
        } catch (err) {
          console.error("Failed to parse stream event:", err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("Stream events disconnected, reconnecting...");
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, [handlers]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
