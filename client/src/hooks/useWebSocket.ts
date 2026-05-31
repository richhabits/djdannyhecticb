import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketHookOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
  maxRetries?: number;
  initialBackoff?: number;
  maxBackoff?: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export function useWebSocket(url: string, options: WebSocketHookOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true,
    maxRetries = 10,
    initialBackoff = 1000,
    maxBackoff = 30000,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const currentBackoff = useRef(initialBackoff);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus(reconnectAttempt > 0 ? 'reconnecting' : 'connecting');

    try {
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        setReconnectAttempt(0);
        currentBackoff.current = initialBackoff;
        onConnect?.();
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (e) {
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };

      socket.onclose = (event) => {
        // Don't reconnect if we closed intentionally or hit max retries
        if (event.wasClean) {
          setStatus('disconnected');
          return;
        }

        setStatus('disconnected');
        onDisconnect?.();

        if (reconnectAttempt < maxRetries) {
          // Exponential backoff
          const nextBackoff = Math.min(currentBackoff.current * 1.5, maxBackoff);
          currentBackoff.current = nextBackoff;

          setReconnectAttempt(prev => prev + 1);
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, nextBackoff);
        } else {
          setStatus('error');
        }
      };

      socket.onerror = (error) => {
        setStatus('error');
        onError?.(error);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
      setStatus('error');
    }
  }, [url, onConnect, onDisconnect, onMessage, onError, reconnectAttempt, maxRetries, initialBackoff, maxBackoff]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (ws.current) {
      ws.current.close(); // wasClean will be true
      ws.current = null;
    }
    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    lastMessage,
    reconnectAttempt,
    sendMessage,
    connect,
    disconnect,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
  };
}
