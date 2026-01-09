import { WebSocketServer, WebSocket, RawData } from "ws";
import jwt from "jsonwebtoken";
import { uuid } from "@framework/utils";

interface ClientConnection {
  id: string;
  socket: WebSocket;
  authenticated: boolean;
  permissions: string[];
  lastPing: number;
}

interface WSMessage {
  event: string;
  data?: unknown;
  requestId?: string;
}

type MessageHandler = (client: ClientConnection, data: unknown) => void | Promise<void>;

export class WebSocketManager {
  private server: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();
  private handlers: Map<string, MessageHandler> = new Map();
  private port: number;
  private secret: string;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(port: number, secret: string) {
    this.port = port;
    this.secret = secret;
  }

  start(): void {
    this.server = new WebSocketServer({ port: this.port });

    this.server.on("connection", (socket, request) => {
      const clientId = uuid();
      const client: ClientConnection = {
        id: clientId,
        socket,
        authenticated: false,
        permissions: [],
        lastPing: Date.now(),
      };

      this.clients.set(clientId, client);
      console.log(`[websocket] Client connected: ${clientId}`);

      // Send connection acknowledgment
      this.send(socket, "connected", { clientId });

      socket.on("message", (data) => this.handleMessage(client, data));
      socket.on("close", () => this.handleDisconnect(clientId));
      socket.on("error", (error) => console.error(`[websocket] Client error:`, error));
      socket.on("pong", () => {
        client.lastPing = Date.now();
      });
    });

    this.server.on("error", (error) => {
      console.error(`[websocket] Server error:`, error);
    });

    // Ping clients every 30 seconds
    this.pingInterval = setInterval(() => {
      for (const [id, client] of this.clients) {
        if (Date.now() - client.lastPing > 60000) {
          console.log(`[websocket] Client timed out: ${id}`);
          client.socket.terminate();
          this.clients.delete(id);
        } else {
          client.socket.ping();
        }
      }
    }, 30000);

    console.log(`[websocket] Server started on port ${this.port}`);
  }

  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    for (const client of this.clients.values()) {
      client.socket.close();
    }

    this.clients.clear();
    this.server?.close();
    console.log(`[websocket] Server stopped`);
  }

  private handleMessage(client: ClientConnection, rawData: RawData): void {
    try {
      const message: WSMessage = JSON.parse(rawData.toString());

      // Handle authentication
      if (message.event === "auth") {
        this.handleAuth(client, message.data as { token: string });
        return;
      }

      // Require authentication for other messages
      if (!client.authenticated) {
        this.send(client.socket, "error", { message: "Not authenticated" });
        return;
      }

      // Find and execute handler
      const handler = this.handlers.get(message.event);
      if (handler) {
        handler(client, message.data);
      } else {
        this.send(client.socket, "error", { message: `Unknown event: ${message.event}` });
      }
    } catch (error) {
      console.error(`[websocket] Message parse error:`, error);
      this.send(client.socket, "error", { message: "Invalid message format" });
    }
  }

  private handleAuth(client: ClientConnection, data: { token: string }): void {
    try {
      const decoded = jwt.verify(data.token, this.secret) as {
        sub: string;
        permissions: string[];
      };

      client.authenticated = true;
      client.permissions = decoded.permissions || [];

      this.send(client.socket, "authenticated", {
        clientId: client.id,
        permissions: client.permissions,
      });

      console.log(`[websocket] Client authenticated: ${client.id}`);
    } catch (error) {
      this.send(client.socket, "error", { message: "Invalid token" });
      client.socket.close();
    }
  }

  private handleDisconnect(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`[websocket] Client disconnected: ${clientId}`);
  }

  private send(socket: WebSocket, event: string, data: unknown): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    }
  }

  // Public methods
  on(event: string, handler: MessageHandler): void {
    this.handlers.set(event, handler);
  }

  broadcast(event: string, data: unknown): void {
    for (const client of this.clients.values()) {
      if (client.authenticated) {
        this.send(client.socket, event, data);
      }
    }
  }

  sendToClient(clientId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (client && client.authenticated) {
      this.send(client.socket, event, data);
      return true;
    }
    return false;
  }

  getConnectedClients(): string[] {
    return Array.from(this.clients.values())
      .filter((c) => c.authenticated)
      .map((c) => c.id);
  }

  hasPermission(clientId: string, permission: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    return client.permissions.includes(permission) || client.permissions.includes("admin");
  }

  generateToken(sub: string, permissions: string[], expiresIn: string = "24h"): string {
    return jwt.sign({ sub, permissions }, this.secret, { expiresIn });
  }
}
