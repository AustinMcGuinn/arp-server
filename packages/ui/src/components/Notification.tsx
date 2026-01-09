import { type JSX, splitProps, Show } from "solid-js";
import { cn } from "../utils/cn";
import type { NotificationType } from "@framework/types";

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose?: () => void;
  class?: string;
}

const icons: Record<NotificationType, JSX.Element> = {
  success: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const typeStyles: Record<NotificationType, string> = {
  success: "bg-emerald-900/80 border-emerald-500/50 text-emerald-100",
  error: "bg-red-900/80 border-red-500/50 text-red-100",
  warning: "bg-amber-900/80 border-amber-500/50 text-amber-100",
  info: "bg-blue-900/80 border-blue-500/50 text-blue-100",
};

const iconStyles: Record<NotificationType, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  error: "bg-red-500/20 text-red-400",
  warning: "bg-amber-500/20 text-amber-400",
  info: "bg-blue-500/20 text-blue-400",
};

export function Notification(props: NotificationProps) {
  const [local] = splitProps(props, ["type", "title", "message", "onClose", "class"]);

  return (
    <div
      class={cn(
        "flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg",
        "animate-in slide-in-from-right-full duration-300",
        typeStyles[local.type],
        local.class
      )}
    >
      <div class={cn("p-1.5 rounded-full", iconStyles[local.type])}>
        {icons[local.type]}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium">{local.title}</p>
        <p class="text-sm opacity-80 mt-0.5">{local.message}</p>
      </div>
      <Show when={local.onClose}>
        <button
          onClick={local.onClose}
          class="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Show>
    </div>
  );
}
