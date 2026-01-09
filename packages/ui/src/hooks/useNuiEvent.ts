import { onMount, onCleanup } from "solid-js";
import type { NuiMessage } from "@framework/types";

/**
 * Hook for listening to NUI messages from the client
 */
export function useNuiEvent<T = unknown>(
  action: string,
  handler: (data: T) => void
): void {
  onMount(() => {
    const eventListener = (event: MessageEvent<NuiMessage<T>>) => {
      const { action: eventAction, data } = event.data;

      if (eventAction === action) {
        handler(data);
      }
    };

    window.addEventListener("message", eventListener);

    onCleanup(() => {
      window.removeEventListener("message", eventListener);
    });
  });
}
