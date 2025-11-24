import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WSMessage } from './types.js';

interface Client {
  ws: WebSocket;
  subscribedOrders: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<Client> = new Set();

  init(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      console.log('📱 New WebSocket client connected');

      const client: Client = {
        ws,
        subscribedOrders: new Set(),
      };

      this.clients.add(client);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'subscribe' && message.orderId) {
            client.subscribedOrders.add(message.orderId);
            console.log(`   Subscribed to order: ${message.orderId}`);
          }
        } catch (error) {
          console.error('Failed to parse client message:', error);
        }
      });

      ws.on('close', () => {
        console.log('📴 WebSocket client disconnected');
        this.clients.delete(client);
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        this.clients.delete(client);
      });

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);
    });

    console.log('🔌 WebSocket server initialized');
  }

  broadcast(message: WSMessage): void {
    const payload = JSON.stringify(message);

    for (const client of this.clients) {
      // Only send to clients subscribed to this order
      if (client.subscribedOrders.has(message.orderId)) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload);
          console.log(`   Sent ${message.type} to subscriber of ${message.orderId}`);
        }
      }
    }
  }

  // Broadcast to all clients (for general updates)
  broadcastAll(message: WSMessage): void {
    const payload = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }
}

export const wsManager = new WebSocketManager();
