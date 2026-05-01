/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Real-time WebSocket Hook for Live Features
 */

import { useEffect, useRef, useCallback, useState } from "react";

interface RealtimeConfig {
  liveSessionId: number;
  userId: number;
  baseUrl?: string;
}

interface RealtimeMessage {
  type: string;
  data: any;
}

export function useRealtime(config: RealtimeConfig) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const baseUrl =
    config.baseUrl || (window.location.protocol === "https:" ? "wss:" : "ws:");
  const wsUrl = `${baseUrl}//${window.location.host}/api/live/ws?sessionId=${config.liveSessionId}&userId=${config.userId}`;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setReconnectAttempts(0);

        // Send initial ping
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    }
  }, [wsUrl, reconnectAttempts]);

  const send = useCallback((message: RealtimeMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  const subscribe = useCallback(
    (handler: (message: RealtimeMessage) => void) => {
      if (!wsRef.current) {
        connect();
      }

      const originalOnMessage = wsRef.current?.onmessage;

      const onMessage = (event: MessageEvent) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handler(message);
        } catch (error) {
          console.error("Message parse error:", error);
        }
      };

      if (wsRef.current) {
        wsRef.current.onmessage = onMessage;
      }

      // Return unsubscribe function
      return () => {
        if (wsRef.current && originalOnMessage) {
          wsRef.current.onmessage = originalOnMessage;
        }
      };
    },
    [connect]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Keep-alive ping
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      send({ type: "ping", data: {} });
    }, 30000); // Every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, send]);

  return {
    isConnected,
    send,
    subscribe,
    disconnect,
  };
}
