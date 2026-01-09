import { type JSX, Show, splitProps, createSignal } from "solid-js";
import { cn } from "../utils/cn";

export interface TooltipProps {
  content: string;
  children: JSX.Element;
  position?: "top" | "bottom" | "left" | "right";
  class?: string;
}

export function Tooltip(props: TooltipProps) {
  const [local] = splitProps(props, ["content", "children", "position", "class"]);
  const [show, setShow] = createSignal(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      class="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {local.children}
      <Show when={show()}>
        <div
          class={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-nowrap",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            positionStyles[local.position ?? "top"],
            local.class
          )}
        >
          {local.content}
        </div>
      </Show>
    </div>
  );
}
