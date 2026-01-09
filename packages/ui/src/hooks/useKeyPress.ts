import { onMount, onCleanup } from "solid-js";

/**
 * Hook for handling key press events
 */
export function useKeyPress(
  key: string,
  handler: () => void,
  options?: { preventDefault?: boolean }
): void {
  onMount(() => {
    const keyListener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        if (options?.preventDefault) {
          event.preventDefault();
        }
        handler();
      }
    };

    window.addEventListener("keydown", keyListener);

    onCleanup(() => {
      window.removeEventListener("keydown", keyListener);
    });
  });
}
