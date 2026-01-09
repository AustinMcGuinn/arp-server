type NuiCallback = (data: unknown, cb: (result: unknown) => void) => void;

export class NuiManager {
  private callbacks: Map<string, NuiCallback> = new Map();

  /**
   * Register a NUI callback
   */
  register(name: string, callback: NuiCallback): void {
    RegisterNuiCallbackType(name);
    on(`__cfx_nui:${name}`, callback);
    this.callbacks.set(name, callback);
  }

  /**
   * Send a message to NUI
   */
  send(action: string, data: unknown): void {
    SendNUIMessage({ action, data });
  }

  /**
   * Set NUI focus
   */
  setFocus(hasFocus: boolean, hasCursor: boolean): void {
    SetNuiFocus(hasFocus, hasCursor);
  }

  /**
   * Check if NUI is focused
   */
  isFocused(): boolean {
    return IsNuiFocused();
  }

  /**
   * Close NUI and remove focus
   */
  close(): void {
    this.setFocus(false, false);
    this.send("close", {});
  }

  /**
   * Open NUI with focus
   */
  open(action: string, data: unknown = {}): void {
    this.setFocus(true, true);
    this.send(action, data);
  }
}

// Helper function to wrap NUI callbacks with type safety
export function createNuiCallback<TInput, TOutput>(
  handler: (data: TInput) => TOutput | Promise<TOutput>
): NuiCallback {
  return async (data: unknown, cb: (result: unknown) => void) => {
    try {
      const result = await handler(data as TInput);
      cb({ success: true, data: result });
    } catch (error) {
      console.error("NUI callback error:", error);
      cb({ success: false, error: String(error) });
    }
  };
}
