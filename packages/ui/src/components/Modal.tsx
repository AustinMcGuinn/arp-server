import { type JSX, Show, splitProps, createEffect, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "../utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
  class?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal(props: ModalProps) {
  const [local] = splitProps(props, ["open", "onClose", "title", "children", "class", "size"]);

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  createEffect(() => {
    if (local.open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          local.onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      onCleanup(() => document.removeEventListener("keydown", handleEscape));
    }
  });

  return (
    <Show when={local.open}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={local.onClose}
          />

          {/* Modal Content */}
          <div
            class={cn(
              "relative w-full mx-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl",
              "animate-in fade-in-0 zoom-in-95",
              sizeStyles[local.size ?? "md"],
              local.class
            )}
          >
            {local.title && (
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                <h2 class="text-lg font-semibold text-white">{local.title}</h2>
                <button
                  onClick={local.onClose}
                  class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div class="p-6">{local.children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
