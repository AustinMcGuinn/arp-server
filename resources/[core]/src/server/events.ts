import type { ServerEventName, ClientEventName } from "@framework/types";
import { RESOURCE_NAME } from "../shared";

type EventHandler<T = unknown> = (source: number, ...args: T[]) => void;
type EventCallback<T = unknown> = (...args: T[]) => void;

interface RegisteredEvent {
  name: string;
  handler: EventCallback;
  isNet: boolean;
}

export class EventManager {
  private events: Map<string, RegisteredEvent[]> = new Map();

  /**
   * Register a server event handler
   */
  on<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const wrappedHandler = (...args: unknown[]) => {
      const source = (globalThis as any).source as number;
      handler(source, ...(args as T[]));
    };

    on(eventName, wrappedHandler);

    const existing = this.events.get(eventName) ?? [];
    existing.push({ name: eventName, handler: wrappedHandler, isNet: false });
    this.events.set(eventName, existing);
  }

  /**
   * Register a net event handler (from client)
   */
  onNet<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const wrappedHandler = (...args: unknown[]) => {
      const source = (globalThis as any).source as number;
      handler(source, ...(args as T[]));
    };

    onNet(eventName, wrappedHandler);

    const existing = this.events.get(eventName) ?? [];
    existing.push({ name: eventName, handler: wrappedHandler, isNet: true });
    this.events.set(eventName, existing);
  }

  /**
   * Emit an event to all server handlers
   */
  emit(eventName: string, ...args: unknown[]): void {
    emit(eventName, ...args);
  }

  /**
   * Emit an event to a specific client
   */
  emitClient(eventName: string, target: number | number[], ...args: unknown[]): void {
    if (Array.isArray(target)) {
      for (const source of target) {
        emitNet(eventName, source, ...args);
      }
    } else {
      emitNet(eventName, target, ...args);
    }
  }

  /**
   * Emit an event to all clients
   */
  emitAllClients(eventName: string, ...args: unknown[]): void {
    emitNet(eventName, -1, ...args);
  }

  /**
   * Remove all handlers for an event
   */
  off(eventName: string): void {
    this.events.delete(eventName);
  }

  /**
   * Create a typed event emitter for framework events
   */
  createFrameworkEvent<T extends Record<string, unknown[]>>(events: T) {
    return {
      emit: <K extends keyof T>(event: K, ...args: T[K]) => {
        this.emit(event as string, ...args);
      },
      emitClient: <K extends keyof T>(event: K, target: number | number[], ...args: T[K]) => {
        this.emitClient(event as string, target, ...args);
      },
    };
  }
}

// Create singleton instance
export const eventManager = new EventManager();

// Helper functions
export function onFrameworkEvent(eventName: ServerEventName, handler: EventHandler): void {
  eventManager.on(eventName, handler);
}

export function onClientEvent(eventName: string, handler: EventHandler): void {
  eventManager.onNet(eventName, handler);
}

export function emitFrameworkEvent(eventName: ServerEventName, ...args: unknown[]): void {
  eventManager.emit(eventName, ...args);
}

export function emitClientEvent(eventName: ClientEventName, target: number | number[], ...args: unknown[]): void {
  eventManager.emitClient(eventName, target, ...args);
}
