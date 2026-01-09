import { createSignal, createContext, useContext, type ParentComponent } from "solid-js";
import { authStore, logout } from "./auth";

interface WSMessage {
  event: string;
  data?: unknown;
}

type MessageHandler = (data: unknown) => void;

const [isConnected, setIsConnected] = createSignal(false);
const [serverStats, setServerStats] = createSignal({ onlinePlayers: 0, maxPlayers: 32, uptime: 0 });

let socket: WebSocket | null = null;
const handlers: Map<string, Set<MessageHandler>> = new Map();

export function connect(): void {
  if (socket?.readyState === WebSocket.OPEN) return;

  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3001";
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
    // Authenticate
    if (authStore.token) {
      send("auth", { token: authStore.token });
    }
  };

  socket.onmessage = (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    setIsConnected(false);

    // Reconnect after 5 seconds
    setTimeout(() => {
      if (authStore.token) {
        connect();
      }
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

function handleMessage(message: WSMessage): void {
  switch (message.event) {
    case "connected":
      console.log("Connected to server");
      break;

    case "authenticated":
      console.log("Authenticated");
      setIsConnected(true);
      // Request initial data
      send("getStats", {});
      send("getPlayers", {});
      break;

    case "error":
      console.error("Server error:", message.data);
      if ((message.data as any)?.message === "Invalid token") {
        logout();
      }
      break;

    case "stats":
      setServerStats(message.data as any);
      break;

    default:
      // Notify registered handlers
      const eventHandlers = handlers.get(message.event);
      if (eventHandlers) {
        for (const handler of eventHandlers) {
          handler(message.data);
        }
      }
  }
}

export function send(event: string, data?: unknown): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
}

export function subscribe(event: string, handler: MessageHandler): () => void {
  if (!handlers.has(event)) {
    handlers.set(event, new Set());
  }
  handlers.get(event)!.add(handler);

  return () => {
    handlers.get(event)?.delete(handler);
  };
}

export function disconnect(): void {
  socket?.close();
  socket = null;
  setIsConnected(false);
}

export function useWebSocket() {
  return {
    isConnected,
    serverStats,
    connect,
    disconnect,
    send,
    subscribe,
  };
}
