import { useEffect, useState, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

interface WSMessage {
  type: 'PAID' | 'PENDING' | 'EXPIRED';
  orderId: string;
  txHash?: string;
}

export function useInvoiceWS(orderId: string | undefined) {
  const [status, setStatus] = useState<'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED'>('UNPAID');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const connect = () => {
      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        // Subscribe to this specific order
        ws.send(JSON.stringify({ type: 'subscribe', orderId }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);

          if (data.orderId === orderId) {
            setStatus(data.type);
            if (data.txHash) {
              setTxHash(data.txHash);
            }
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;

        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [orderId]);

  return { status, txHash, connected };
}
