import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CapturedRequest } from '../types';

// Socket.io dan API diproxy melalui Vite (/socket.io → 3005, /api → 3005)
// sehingga browser hanya perlu akses ke satu port (port Vite)
const API_BASE = '/api';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebhookResult {
  requests: CapturedRequest[];
  status: ConnectionStatus;
  clearRequests: () => Promise<void>;
}

export function useWebhook(bucketId: string): UseWebhookResult {
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Tanpa URL → connect ke origin yang sama (port Vite)
    // Vite proxy /socket.io/* ke backend port 3005
    const socket = io({ forceNew: true, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('join_bucket', bucketId);
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error:', err.message);
      setStatus('disconnected');
    });

    socket.on('new_request', (req: CapturedRequest) => {
      setRequests((prev) => [req, ...prev]);
    });

    fetch(`${API_BASE}/bucket/${bucketId}`)
      .then((res) => res.json() as Promise<CapturedRequest[]>)
      .then((data) => setRequests(data))
      .catch(() => {});

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [bucketId]);

  const clearRequests = async () => {
    await fetch(`${API_BASE}/bucket/${bucketId}`, { method: 'DELETE' });
    setRequests([]);
  };

  return { requests, status, clearRequests };
}
